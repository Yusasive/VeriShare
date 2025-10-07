const express = require("express");
const { BlockchainService } = require("verishare-blockchain");

const router = express.Router();
const blockchainService = new BlockchainService();

// Get blockchain info
router.get("/info", (req, res) => {
  const response = {
    chainLength: blockchainService.getChain().length,
    latestBlock: blockchainService.getLatestBlock(),
    isValid: blockchainService.isChainValid(),
    nodeAddress: blockchainService.nodeAddress,
    tips: blockchainService.getTips().length,
  };
  res.json(response);
});

// Get full blockchain
router.get("/chain", (req, res) => {
  res.json({
    chain: blockchainService.getChain(),
    length: blockchainService.getChain().length,
  });
});

// Get balance
router.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = blockchainService.getBalance(address);
  res.json({ address, balance });
});

// Mine a new block
router.post("/mine", (req, res) => {
  const { rewardAddress } = req.body;

  if (!rewardAddress) {
    return res.status(400).json({ error: "Reward address is required" });
  }

  try {
    const block = blockchainService.minePendingTransactions(rewardAddress);
    res.json({
      message: "Block mined successfully",
      block: block,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create transaction
router.post("/transaction", (req, res) => {
  const { fromAddress, toAddress, amount, data, type } = req.body;

  if (!fromAddress || !toAddress || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const transaction = blockchainService.createTransaction(
      fromAddress,
      toAddress,
      amount,
      data,
      type || "transfer"
    );
    blockchainService.addTransaction(transaction);

    res.json({
      message: "Transaction added successfully",
      transaction: transaction,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending transactions
router.get("/transactions/pending", (req, res) => {
  // Note: This would need to be implemented in the service
  res.json({ pending: [] });
});

// Credential endpoints
router.post("/credential/store", (req, res) => {
  const { ownerAddress, credentialHash, metadata } = req.body;

  if (!ownerAddress || !credentialHash) {
    return res
      .status(400)
      .json({ error: "Owner address and credential hash are required" });
  }

  try {
    const credentialId = blockchainService.storeCredential(
      ownerAddress,
      credentialHash,
      metadata
    );
    res.json({
      message: "Credential stored successfully",
      credentialId: credentialId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/credential/verify/:credentialId/:ownerAddress", (req, res) => {
  const { credentialId, ownerAddress } = req.params;

  try {
    const result = blockchainService.verifyCredential(
      credentialId,
      ownerAddress
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/credential/share", (req, res) => {
  const { credentialId, fromAddress, toAddress, expiryHours } = req.body;

  if (!credentialId || !fromAddress || !toAddress) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const share = blockchainService.shareCredential(
      credentialId,
      fromAddress,
      toAddress,
      expiryHours || 24
    );
    res.json({
      message: "Credential shared successfully",
      share: share,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/credential/revoke", (req, res) => {
  const { credentialId, ownerAddress } = req.body;

  if (!credentialId || !ownerAddress) {
    return res
      .status(400)
      .json({ error: "Credential ID and owner address are required" });
  }

  try {
    blockchainService.revokeCredential(credentialId, ownerAddress);
    res.json({ message: "Credential revoked successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Organization verification
router.post("/organization/verify", (req, res) => {
  const { orgAddress } = req.body;

  if (!orgAddress) {
    return res.status(400).json({ error: "Organization address is required" });
  }

  try {
    blockchainService.verifyOrganization(orgAddress);
    res.json({ message: "Organization verified successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/organization/verify/:orgAddress", (req, res) => {
  const { orgAddress } = req.params;
  const isVerified = blockchainService.isOrganizationVerified(orgAddress);
  res.json({ orgAddress, verified: isVerified });
});

// Audit trail
router.get("/audit/:address", (req, res) => {
  const { address } = req.params;
  const auditTrail = blockchainService.getAuditTrail(address);
  res.json({ address, auditTrail });
});

// Get credentials by owner
router.get("/credentials/:ownerAddress", (req, res) => {
  const { ownerAddress } = req.params;
  const credentials = blockchainService.getCredentialsByOwner(ownerAddress);
  res.json({ ownerAddress, credentials });
});

// P2P network endpoints
router.post("/nodes/register", (req, res) => {
  const { nodes } = req.body;

  if (!nodes || !Array.isArray(nodes)) {
    return res.status(400).json({ error: "Nodes array is required" });
  }

  nodes.forEach((node) => blockchainService.addNode(node));
  res.json({ message: "Nodes registered successfully" });
});

router.get("/nodes", (req, res) => {
  const nodes = blockchainService.getNodes();
  res.json({ nodes });
});

// Consensus
router.get("/consensus", (req, res) => {
  const resolved = blockchainService.resolveConflicts();
  res.json({
    message: resolved ? "Consensus resolved" : "No conflicts found",
    valid: resolved,
  });
});

// Generate new address
router.get("/address/generate", (req, res) => {
  const address = blockchainService.generateAddress();
  res.json({ address });
});

module.exports = router;
