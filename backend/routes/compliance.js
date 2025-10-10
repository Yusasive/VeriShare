const express = require("express");
const express = require("express");
const { randomUUID } = require("crypto");
const ComplianceReport = require("../models/ComplianceReport");
const Credential = require("../models/Credential");
const CredentialShare = require("../models/CredentialShare");
const ConsentRequest = require("../models/ConsentRequest");

const router = express.Router();

const badRequest = (res, message) => res.status(400).json({ error: message });

const auth = require("../middleware/auth");

router.get("/report", auth, async (req, res, next) => {
  try {
    const { ownerAddress, periodStart, periodEnd } = req.query;
    if (!ownerAddress) return badRequest(res, "ownerAddress is required");
    if (req.user.address !== ownerAddress) return res.status(403).json({ error: "Owner mismatch" });

    const start = periodStart ? new Date(periodStart) : new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const end = periodEnd ? new Date(periodEnd) : new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return badRequest(res, "Invalid periodStart or periodEnd date");
    }

    const [credsTotal, credsRevoked, sharesMade, sharesExpired, reqsApproved, reqsDenied] = await Promise.all([
      Credential.countDocuments({ ownerAddress }),
      Credential.countDocuments({ ownerAddress, status: "revoked" }),
      CredentialShare.countDocuments({ fromAddress: ownerAddress, createdAt: { $gte: start, $lte: end } }),
      CredentialShare.countDocuments({ fromAddress: ownerAddress, status: "expired", updatedAt: { $gte: start, $lte: end } }),
      ConsentRequest.countDocuments({ ownerAddress, status: "approved", decisionAt: { $gte: start, $lte: end } }),
      ConsentRequest.countDocuments({ ownerAddress, status: "denied", decisionAt: { $gte: start, $lte: end } }),
    ]);

    const metrics = {
      period: { start, end },
      credentials: { total: credsTotal, revoked: credsRevoked, active: Math.max(0, credsTotal - credsRevoked) },
      shares: { made: sharesMade, expired: sharesExpired },
      consent: { approved: reqsApproved, denied: reqsDenied },
    };

    const report = await ComplianceReport.create({
      reportId: randomUUID(),
      ownerAddress,
      periodStart: start,
      periodEnd: end,
      metrics,
      generatedBy: "system",
    });

    res.json({ message: "Report generated", report });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
