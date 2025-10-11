const express = require("express");
const auth = require("../middleware/auth");
const roles = require("../middleware/roles");
const EvmService = require("../services/evmService");

const router = express.Router();

function getSvc() {
  return new EvmService();
}

router.get("/org/verified/:address", async (req, res) => {
  try {
    const svc = getSvc();
    const ok = await svc.isOrgVerified(req.params.address);
    res.json({ success: true, verified: ok });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post("/org/verify", auth, roles.adminOnly, async (req, res) => {
  try {
    const { org, name, uri } = req.body;
    const svc = getSvc();
    const out = await svc.verifyOrg(org, name || "", uri || "");
    res.json({ success: true, ...out });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post("/credential/issue", auth, async (req, res) => {
  try {
    const { subject, hashHex, uri } = req.body;
    const svc = getSvc();
    const out = await svc.issueCredential(subject, hashHex, uri || "");
    res.json({ success: true, ...out });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post("/credential/revoke", auth, async (req, res) => {
  try {
    const { id } = req.body;
    const svc = getSvc();
    const out = await svc.revokeCredential(id);
    res.json({ success: true, ...out });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post("/share/grant", auth, async (req, res) => {
  try {
    const { credentialId, org, expiresAt } = req.body; // expiresAt unix seconds
    const svc = getSvc();
    const out = await svc.grantShare(credentialId, org, expiresAt || 0);
    res.json({ success: true, ...out });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post("/share/revoke", auth, async (req, res) => {
  try {
    const { shareId } = req.body;
    const svc = getSvc();
    const out = await svc.revokeShare(shareId);
    res.json({ success: true, ...out });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post("/consent/log", auth, async (req, res) => {
  try {
    const { org, credentialId, scopeHashHex, approved } = req.body;
    const svc = getSvc();
    const out = await svc.logConsent(org, credentialId, scopeHashHex, !!approved);
    res.json({ success: true, ...out });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post("/wallet/bind", auth, async (req, res) => {
  try {
    const { pubKeyHex } = req.body;
    const svc = getSvc();
    if (!svc.walletRegistry) throw new Error("WalletRegistry not configured");
    const tx = await svc.walletRegistry.bind(pubKeyHex);
    const rc = await tx.wait();
    res.json({ success: true, txHash: rc.hash });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post("/wallet/unbind", auth, async (req, res) => {
  try {
    const { pubKeyHex } = req.body;
    const svc = getSvc();
    if (!svc.walletRegistry) throw new Error("WalletRegistry not configured");
    const tx = await svc.walletRegistry.unbind(pubKeyHex);
    const rc = await tx.wait();
    res.json({ success: true, txHash: rc.hash });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// EIP-712 relayed endpoints (no auth required)
router.post("/credential/issueBySig", async (req, res) => {
  try {
    const { issuer, subject, hashHex, uri, deadline, v, r, s } = req.body;
    const svc = getSvc();
    const out = await svc.issueCredentialBySig(issuer, subject, hashHex, uri || "", deadline, v, r, s);
    res.json({ success: true, ...out });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post("/share/grantBySig", async (req, res) => {
  try {
    const { subject, credentialId, org, expiresAt, deadline, v, r, s } = req.body;
    const svc = getSvc();
    const out = await svc.grantShareBySig(subject, credentialId, org, expiresAt || 0, deadline, v, r, s);
    res.json({ success: true, ...out });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post("/consent/logBySig", async (req, res) => {
  try {
    const { subject, org, credentialId, scopeHashHex, approved, deadline, v, r, s } = req.body;
    const svc = getSvc();
    const out = await svc.logConsentBySig(subject, org, credentialId, scopeHashHex, !!approved, deadline, v, r, s);
    res.json({ success: true, ...out });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

module.exports = router;
