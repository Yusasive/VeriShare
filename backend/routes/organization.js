const express = require("express");
const Organization = require("../models/Organization");
const { adminOnly } = require("../middleware/roles");
const auth = require("../middleware/auth");
const blockchainService = require("../services/blockchainService");

const router = express.Router();
const badRequest = (res, message) => res.status(400).json({ error: message });

// Organization submits verification application
router.post("/apply", auth, async (req, res, next) => {
  try {
    const { address, name = "", domain = "", documents = [], metadata = {} } = req.body;
    if (!address) return badRequest(res, "address is required");
    if (req.user.address !== address) return res.status(403).json({ error: "Address mismatch" });

    const org = await Organization.findOneAndUpdate(
      { address },
      {
        address,
        name,
        domain,
        documents,
        metadata,
        verificationStatus: "pending",
        appliedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    res.status(201).json({ message: "Application submitted", organization: org });
  } catch (err) {
    next(err);
  }
});

// Admin reviews an application and sets status; approved => on-chain verify
router.post("/review", adminOnly, async (req, res, next) => {
  try {
    const { address, status, reviewNotes = "", metadata = {} } = req.body;
    if (!address || !status) return badRequest(res, "address and status are required");
    if (!["approved", "rejected"].includes(status)) return badRequest(res, "status must be approved or rejected");

    const update = {
      verificationStatus: status,
      reviewNotes,
      metadata,
      verified: status === "approved",
      verifiedAt: status === "approved" ? new Date() : undefined,
    };

    const org = await Organization.findOneAndUpdate({ address }, update, { new: true }).lean();
    if (!org) return res.status(404).json({ error: "Organization not found" });

    if (status === "approved") {
      // Reflect on-chain certified status
      blockchainService.verifyOrganization(address);
    }

    res.json({ message: "Review recorded", organization: org });
  } catch (err) {
    next(err);
  }
});

// Public: fetch organization profile
router.get("/:address", async (req, res, next) => {
  try {
    const { address } = req.params;
    const org = await Organization.findOne({ address }).lean();
    if (!org) return res.status(404).json({ error: "Not found" });
    res.json({ organization: org, onChainVerified: blockchainService.isOrganizationVerified(address) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
