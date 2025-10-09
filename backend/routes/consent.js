const express = require("express");
const { randomUUID, randomBytes } = require("crypto");
const ConsentRequest = require("../models/ConsentRequest");
const CredentialShare = require("../models/CredentialShare");
const AccessToken = require("../models/AccessToken");
const blockchainService = require("../services/blockchainService");
const auth = require("../middleware/auth");

const router = express.Router();

const badRequest = (res, message) => res.status(400).json({ error: message });

async function expireOldRequests() {
  await ConsentRequest.updateMany(
    { status: "pending", expiresAt: { $lte: new Date() } },
    { status: "expired" }
  );
}

router.post("/request", async (req, res, next) => {
  try {
    const { credentialId, ownerAddress, organizationAddress, requestedData = [], expiresInHours = 24 } = req.body;

    if (!credentialId || !ownerAddress || !organizationAddress) {
      return badRequest(res, "credentialId, ownerAddress, organizationAddress are required");
    }

    const requestId = randomUUID();
    const expiresAt = new Date(Date.now() + Number(expiresInHours) * 3600 * 1000);

    const request = await ConsentRequest.create({
      requestId,
      credentialId,
      ownerAddress,
      organizationAddress,
      requestedData,
      status: "pending",
      expiresAt,
      auditTrail: [
        { type: "created", at: new Date(), by: organizationAddress },
      ],
    });

    res.status(201).json({ message: "Consent request created", request });
  } catch (err) {
    next(err);
  }
});

router.post("/decision", async (req, res, next) => {
  try {
    const { requestId, ownerAddress, decision, reason = "" } = req.body;

    if (!requestId || !ownerAddress || !decision) {
      return badRequest(res, "requestId, ownerAddress, decision are required");
    }
    if (!["approved", "denied"].includes(decision)) {
      return badRequest(res, "decision must be approved or denied");
    }

    const reqDoc = await ConsentRequest.findOne({ requestId });
    if (!reqDoc) return res.status(404).json({ error: "Consent request not found" });
    if (reqDoc.ownerAddress !== ownerAddress) {
      return res.status(403).json({ error: "Owner address mismatch" });
    }
    if (reqDoc.status !== "pending") {
      return badRequest(res, "Consent request already resolved or expired");
    }

    let share = null;
    if (decision === "approved") {
      const isVerified = blockchainService.isOrganizationVerified(reqDoc.organizationAddress);
      reqDoc.auditTrail.push({ type: "org_verification_checked", at: new Date(), verified: isVerified });

      share = blockchainService.shareCredential(
        reqDoc.credentialId,
        ownerAddress,
        reqDoc.organizationAddress,
        Math.max(1, Math.ceil((reqDoc.expiresAt.getTime() - Date.now()) / 3600000))
      );

      await CredentialShare.findOneAndUpdate(
        { shareId: share.id },
        {
          shareId: share.id,
          credentialId: reqDoc.credentialId,
          fromAddress: ownerAddress,
          toAddress: reqDoc.organizationAddress,
          expiryTime: new Date(share.expiryTime),
          status: "active",
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      if (!isVerified) {
        reqDoc.reason = reqDoc.reason || "Organization not verified at time of approval";
      }
    }

    reqDoc.status = decision;
    reqDoc.decisionAt = new Date();
    reqDoc.reason = reason;
    reqDoc.auditTrail.push({ type: decision, at: reqDoc.decisionAt, by: ownerAddress });
    await reqDoc.save();

    res.json({ message: "Decision recorded", request: reqDoc, share });
  } catch (err) {
    next(err);
  }
});

router.get("/id/:requestId", async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const doc = await ConsentRequest.findOne({ requestId }).lean();
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json({ request: doc });
  } catch (err) {
    next(err);
  }
});

router.get("/owner/:ownerAddress", async (req, res, next) => {
  try {
    const { ownerAddress } = req.params;
    const items = await ConsentRequest.find({ ownerAddress }).sort({ createdAt: -1 }).lean();
    res.json({ count: items.length, requests: items });
  } catch (err) {
    next(err);
  }
});

router.get("/org/:organizationAddress", async (req, res, next) => {
  try {
    const { organizationAddress } = req.params;
    const items = await ConsentRequest.find({ organizationAddress }).sort({ createdAt: -1 }).lean();
    res.json({ count: items.length, requests: items });
  } catch (err) {
    next(err);
  }
});

// Issue a short-lived QR/access token for an existing consent request (org authenticated)
router.post("/token", auth, async (req, res, next) => {
  try {
    const { requestId, expiresInMinutes = 10 } = req.body;
    if (!requestId) return badRequest(res, "requestId is required");

    const reqDoc = await ConsentRequest.findOne({ requestId });
    if (!reqDoc) return res.status(404).json({ error: "Consent request not found" });

    // Only the organization that created the request can issue a token
    if (req.user.address !== reqDoc.organizationAddress) {
      return res.status(403).json({ error: "Not request organization" });
    }

    const token = randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + Math.max(1, Number(expiresInMinutes)) * 60 * 1000);

    const rec = await AccessToken.create({
      token,
      requestId,
      createdBy: req.user.address,
      expiresAt,
    });

    res.status(201).json({ message: "Token created", token: rec.token, expiresAt: rec.expiresAt });
  } catch (err) {
    next(err);
  }
});

// Retrieve minimal info for a token (for QR redemption)
router.get("/token/:token", async (req, res, next) => {
  try {
    await expireOldRequests();
    const { token } = req.params;
    const rec = await AccessToken.findOne({ token, revoked: false }).lean();
    if (!rec) return res.status(404).json({ error: "Token not found" });

    const reqDoc = await ConsentRequest.findOne({ requestId: rec.requestId }).lean();
    if (!reqDoc || reqDoc.status !== "pending") return res.status(410).json({ error: "Request not available" });

    res.json({
      token: rec.token,
      requestId: rec.requestId,
      organizationAddress: reqDoc.organizationAddress,
      requestedData: reqDoc.requestedData,
      expiresAt: rec.expiresAt,
      status: reqDoc.status,
    });
  } catch (err) {
    next(err);
  }
});

// Redeem a token to fetch full consent request context (owner perspective)
router.post("/token/:token/redeem", async (req, res, next) => {
  try {
    await expireOldRequests();
    const { token } = req.params;
    const { ownerAddress } = req.body;
    if (!ownerAddress) return badRequest(res, "ownerAddress is required");

    const rec = await AccessToken.findOne({ token, revoked: false });
    if (!rec) return res.status(404).json({ error: "Token not found" });

    if (rec.expiresAt <= new Date()) return res.status(410).json({ error: "Token expired" });

    const reqDoc = await ConsentRequest.findOne({ requestId: rec.requestId });
    if (!reqDoc || reqDoc.status !== "pending") return res.status(410).json({ error: "Request not available" });

    // Mark token as used (single-use)
    rec.usedAt = new Date();
    await rec.save();

    res.json({ message: "Redeemed", request: reqDoc, ownerAddress });
  } catch (err) {
    next(err);
  }
});

// Revoke a token (org auth)
router.post("/token/:token/revoke", auth, async (req, res, next) => {
  try {
    const { token } = req.params;
    const rec = await AccessToken.findOne({ token });
    if (!rec) return res.status(404).json({ error: "Token not found" });
    const reqDoc = await ConsentRequest.findOne({ requestId: rec.requestId });
    if (!reqDoc) return res.status(404).json({ error: "Request not found" });
    if (req.user.address !== reqDoc.organizationAddress) return res.status(403).json({ error: "Not request organization" });

    rec.revoked = true;
    await rec.save();
    res.json({ message: "Revoked" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
