const express = require("express");
const Organization = require("../models/Organization");
const { adminOnly } = require("../middleware/roles");
const auth = require("../middleware/auth");
const EvmService = require("../services/evmService");

const router = express.Router();
const badRequest = (res, message) => res.status(400).json({ error: message });

function getSvc() {
  return new EvmService();
}

// Organization submits verification application
router.post("/apply", auth, async (req, res, next) => {
  try {
    const {
      address,
      name = "",
      domain = "",
      documents = [],
      metadata = {},
    } = req.body;
    if (!address) return badRequest(res, "address is required");
    if (req.user.address !== address)
      return res.status(403).json({ error: "Address mismatch" });

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

    res
      .status(201)
      .json({ message: "Application submitted", organization: org });
  } catch (err) {
    next(err);
  }
});

// Admin reviews an application and sets status; approved => on-chain verify
router.post("/review", adminOnly, async (req, res, next) => {
  try {
    const { address, status, reviewNotes = "", metadata = {} } = req.body;
    if (!address || !status)
      return badRequest(res, "address and status are required");
    if (!["approved", "rejected"].includes(status))
      return badRequest(res, "status must be approved or rejected");

    let nftTokenId = "";
    let nftTokenUri = "";
    let verifiedAt = undefined;
    if (status === "approved") {
      const svc = getSvc();
      // Call contract and get tokenId
      const tx = await svc.verifier.verifyOrg(
        address,
        org.name || "",
        org.domain || ""
      );
      const rc = await tx.wait();
      // Find OrganizationVerified event
      const ev = rc.logs
        .map((l) => svc.verifier.interface.parseLog(l))
        .find((e) => e.name === "OrganizationVerified");
      nftTokenId = ev?.args?.tokenId?.toString() || "";
      nftTokenUri = ev?.args?.uri || "";
      verifiedAt = new Date();
    }
    const update = {
      verificationStatus: status,
      reviewNotes,
      metadata,
      verified: status === "approved",
      verifiedAt,
      nftTokenId,
      nftTokenUri,
    };
    const org = await Organization.findOneAndUpdate({ address }, update, {
      new: true,
    }).lean();
    if (!org) return res.status(404).json({ error: "Organization not found" });
    res.json({ message: "Review recorded", organization: org });
    // Public: fetch NFT badge info for an org
    router.get("/:address/nft-badge", async (req, res, next) => {
      try {
        const { address } = req.params;
        const org = await Organization.findOne({ address }).lean();
        if (!org || !org.nftTokenId)
          return res.status(404).json({ error: "NFT badge not found" });
        res.json({
          tokenId: org.nftTokenId,
          imageUrl: org.nftTokenUri, // or construct from tokenId if needed
          uri: org.nftTokenUri,
        });
      } catch (err) {
        next(err);
      }
    });
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
    const svc = getSvc();
    const onChainVerified = await svc.isOrgVerified(address);
    res.json({ organization: org, onChainVerified });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
