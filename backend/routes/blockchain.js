const express = require("express");
const express = require("express");
const Credential = require("../models/Credential");
const CredentialShare = require("../models/CredentialShare");
const Organization = require("../models/Organization");
const blockchainService = require("../services/blockchainService");

const router = express.Router();

const markExpiredShares = async () => {
  await CredentialShare.updateMany(
    { status: "active", expiryTime: { $lte: new Date() } },
    { status: "expired" }
  );
};

const badRequest = (res, message) => res.status(400).json({ error: message });

router.get("/info", (req, res) => {
  const chain = blockchainService.getChain();
  res.json({
    nodeAddress: blockchainService.nodeAddress,
    chainLength: chain.length,
    latestBlock: blockchainService.getLatestBlock(),
    pendingTransactions: blockchainService.getPendingTransactions().length,
    isValid: blockchainService.isChainValid(),
    tips: blockchainService.getTips().length,
    nodes: blockchainService.getNodes(),
  });
});

router.get("/chain", (req, res) => {
  const chain = blockchainService.getChain();
  res.json({
    length: chain.length,
    chain,
  });
});

router.get("/transactions/pending", (req, res) => {
  res.json({ pending: blockchainService.getPendingTransactions() });
});

router.post("/transaction", async (req, res, next) => {
  try {
    const {
      fromAddress,
      toAddress,
      amount,
      data = null,
      type = "transfer",
      signature = null,
      timestamp = Date.now(),
      nonce = 0,
      fee = 0,
    } = req.body;

    if (typeof toAddress !== "string" || !toAddress.trim()) {
      return badRequest(res, "Recipient address is required");
    }

    if (
      fromAddress !== null &&
      (typeof fromAddress !== "string" || !fromAddress.trim())
    ) {
      return badRequest(res, "Sender address is required unless null");
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 0) {
      return badRequest(res, "Amount must be a non-negative number");
    }

    const numericNonce = Number(nonce);
    if (!Number.isFinite(numericNonce) || numericNonce < 0) {
      return badRequest(res, "Nonce must be a non-negative number");
    }

    const numericFee = Number(fee);
    if (!Number.isFinite(numericFee) || numericFee < 0) {
      return badRequest(res, "Fee must be a non-negative number");
    }

    if (fromAddress && !signature) {
      return badRequest(res, "Signed transactions require a signature");
    }

    if (fromAddress && !/^04[0-9a-fA-F]{128}$/.test(fromAddress)) {
      return badRequest(
        res,
        "fromAddress must be uncompressed secp256k1 public key hex (130 chars starting with 04)"
      );
    }

    if (fromAddress && !/^([0-9a-fA-F]{2})+$/.test(signature)) {
      return badRequest(res, "signature must be DER hex");
    }

    // Enforce per-address nonce (prevents replay)
    const AddressState = require("../models/AddressState");
    if (fromAddress) {
      const doc = await AddressState.findOne({ address: fromAddress });
      const last = doc?.lastNonce ?? -1;
      if (numericNonce <= last) {
        return badRequest(
          res,
          `nonce must be greater than lastNonce (${last}) for address`
        );
      }
    }

    const transaction = blockchainService.createTransaction({
      fromAddress,
      toAddress,
      amount: numericAmount,
      data,
      type,
      signature,
      timestamp,
      nonce: numericNonce,
      fee: numericFee,
    });

    if (!fromAddress) {
      transaction.signature = null;
    }

    let storedTransaction;
    try {
      storedTransaction = blockchainService.addTransaction(transaction);
    } catch (e) {
      return res
        .status(400)
        .json({ error: e.message || "Invalid transaction" });
    }

    if (fromAddress) {
      await AddressState.findOneAndUpdate(
        { address: fromAddress },
        {
          address: fromAddress,
          lastNonce: numericNonce,
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    }

    res.status(201).json({
      message: "Transaction added successfully",
      transaction: storedTransaction,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/mine", (req, res, next) => {
  try {
    const { rewardAddress } = req.body;

    if (!rewardAddress || typeof rewardAddress !== "string") {
      return badRequest(res, "Reward address is required");
    }

    const pending = blockchainService.getPendingTransactions();
    if (!pending.length) {
      return badRequest(res, "No pending transactions to mine");
    }

    const block = blockchainService.minePendingTransactions(rewardAddress);

    res.json({
      message: "Block mined successfully",
      block,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/credential/store", async (req, res, next) => {
  try {
    const {
      ownerAddress,
      credentialHash,
      metadata = {},
      transactionSignature,
      transactionTimestamp,
      nonce,
      fee = 0,
      ipfsContentBase64,
    } = req.body;

    if (typeof ownerAddress !== "string" || !ownerAddress.trim()) {
      return badRequest(res, "Owner address is required");
    }
    if (!/^04[0-9a-fA-F]{128}$/.test(ownerAddress)) {
      return badRequest(
        res,
        "ownerAddress must be uncompressed secp256k1 public key hex"
      );
    }

    if (typeof credentialHash !== "string" || !credentialHash.trim()) {
      return badRequest(res, "Credential hash is required");
    }

    if (
      !transactionSignature ||
      !transactionTimestamp ||
      typeof nonce === "undefined"
    ) {
      return badRequest(
        res,
        "transactionSignature, transactionTimestamp and nonce are required"
      );
    }

    const extendedMetadata = { ...metadata };

    if (ipfsContentBase64) {
      try {
        const { addBuffer } = require("../services/ipfsService");
        const buffer = Buffer.from(ipfsContentBase64, "base64");
        if (buffer.length > 1024 * 1024) {
          return badRequest(res, "IPFS content too large (max 1MB)");
        }
        const cid = await addBuffer(buffer);
        extendedMetadata.ipfs = { cid };
      } catch (e) {
        return badRequest(res, `IPFS upload failed: ${e.message}`);
      }
    }

    // Build transaction; contract will derive credentialId deterministically
    const transaction = blockchainService.createTransaction({
      fromAddress: ownerAddress,
      toAddress: ownerAddress,
      amount: 0,
      data: { credentialHash, metadata: extendedMetadata },
      type: "credential_store",
      signature: transactionSignature,
      timestamp: transactionTimestamp,
      nonce: Number(nonce),
      fee: Number(fee) || 0,
    });

    let txHash;
    try {
      txHash = transaction.calculateHash();
      blockchainService.addTransaction(transaction);
    } catch (e) {
      return badRequest(res, e.message || "Invalid transaction");
    }

    // Pre-compute deterministic credentialId for client reference
    const { createHash } = require("crypto");
    const credentialId = createHash("sha256")
      .update(ownerAddress + credentialHash)
      .digest("hex");

    const upsertedCredential = await Credential.findOneAndUpdate(
      { credentialId },
      {
        credentialId,
        ownerAddress,
        credentialHash,
        metadata: extendedMetadata,
        status: "active",
        blockchain: {
          txHash,
          type: "credential_store",
          timestamp: transactionTimestamp,
          pending: true,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    res.status(201).json({
      message: "Credential store submitted",
      credentialId,
      txHash,
      record: upsertedCredential,
    });
  } catch (error) {
    next(error);
  }
});

router.get(
  "/credential/verify/:credentialId/:ownerAddress",
  (req, res, next) => {
    try {
      const { credentialId, ownerAddress } = req.params;
      const result = blockchainService.verifyCredential(
        credentialId,
        ownerAddress
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.post("/credential/share", async (req, res, next) => {
  try {
    const {
      credentialId,
      fromAddress,
      toAddress,
      expiryHours = 24,
      transactionSignature,
      transactionTimestamp,
      nonce,
      fee = 0,
    } = req.body;

    if (!credentialId || !fromAddress || !toAddress) {
      return badRequest(
        res,
        "credentialId, fromAddress, and toAddress are required"
      );
    }
    if (
      !/^04[0-9a-fA-F]{128}$/.test(fromAddress) ||
      !/^04[0-9a-fA-F]{128}$/.test(toAddress)
    ) {
      return badRequest(
        res,
        "fromAddress and toAddress must be uncompressed secp256k1 public key hex"
      );
    }

    if (
      !transactionSignature ||
      !transactionTimestamp ||
      typeof nonce === "undefined"
    ) {
      return badRequest(
        res,
        "transactionSignature, transactionTimestamp and nonce are required"
      );
    }

    const orgVerified = blockchainService.isOrganizationVerified(toAddress);
    if (!orgVerified) {
      return badRequest(res, "Organization not verified");
    }

    let txHash;
    try {
      const transaction = blockchainService.createTransaction({
        fromAddress,
        toAddress,
        amount: 0,
        data: { credentialId, expiryHours: Number(expiryHours) || 24 },
        type: "credential_share",
        signature: transactionSignature,
        timestamp: transactionTimestamp,
        nonce: Number(nonce),
        fee: Number(fee) || 0,
      });
      txHash = transaction.calculateHash();
      blockchainService.addTransaction(transaction);
    } catch (e) {
      return badRequest(res, e.message || "Invalid transaction");
    }

    // We don't have shareId until block is mined; store a pending record for traceability
    const pending = await CredentialShare.create({
      shareId: `pending:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
      credentialId,
      fromAddress,
      toAddress,
      expiryTime: new Date(
        Date.now() + (Number(expiryHours) || 24) * 3600 * 1000
      ),
      status: "active",
    });

    res.status(201).json({
      message: "Credential share submitted",
      txHash,
      pending: { id: pending.shareId },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/credential/share/:shareId", async (req, res, next) => {
  try {
    const { shareId } = req.params;
    await markExpiredShares();

    const chainShare = blockchainService.getShare(shareId);
    const shareRecord = await CredentialShare.findOne({ shareId }).lean();

    if (!chainShare && !shareRecord) {
      return res.status(404).json({ error: "Share not found" });
    }

    res.json({
      shareId,
      chainShare,
      shareRecord,
    });
  } catch (error) {
    next(error);
  }
});

router.get(
  "/credential/share/:shareId/:requestingAddress",
  async (req, res, next) => {
    try {
      const { shareId, requestingAddress } = req.params;
      await markExpiredShares();

      const chainResult = blockchainService.verifyShareAccess(
        shareId,
        requestingAddress
      );
      const shareRecord = await CredentialShare.findOne({ shareId }).lean();

      const response = {
        ...chainResult,
        share: shareRecord,
      };

      if (!chainResult.valid && shareRecord) {
        response.reason = chainResult.reason || shareRecord.status;
      }

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

router.get("/credential/shares/:address", async (req, res, next) => {
  try {
    const { address } = req.params;
    await markExpiredShares();

    if (!/^04[0-9a-fA-F]{128}$/.test(address)) {
      return badRequest(
        res,
        "address must be uncompressed secp256k1 public key hex"
      );
    }

    const chainShares = blockchainService.getSharesForAddress(address);
    const shareRecords = await CredentialShare.find({
      $or: [{ fromAddress: address }, { toAddress: address }],
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      address,
      chainShares,
      shareRecords,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/credential/revoke", async (req, res, next) => {
  try {
    const {
      credentialId,
      ownerAddress,
      transactionSignature,
      transactionTimestamp,
      nonce,
      fee = 0,
    } = req.body;

    if (!credentialId || !ownerAddress) {
      return badRequest(res, "credentialId and ownerAddress are required");
    }

    if (
      !transactionSignature ||
      !transactionTimestamp ||
      typeof nonce === "undefined"
    ) {
      return badRequest(
        res,
        "transactionSignature, transactionTimestamp and nonce are required"
      );
    }

    blockchainService.revokeCredential(credentialId, ownerAddress);

    let txHash;
    try {
      const transaction = blockchainService.createTransaction({
        fromAddress: ownerAddress,
        toAddress: ownerAddress,
        amount: 0,
        data: { credentialId },
        type: "credential_revoke",
        signature: transactionSignature,
        timestamp: transactionTimestamp,
        nonce: Number(nonce),
        fee: Number(fee) || 0,
      });
      txHash = transaction.calculateHash();
      blockchainService.addTransaction(transaction);
    } catch (e) {
      return badRequest(res, e.message || "Invalid transaction");
    }

    const credentialRecord = await Credential.findOneAndUpdate(
      { credentialId, ownerAddress },
      {
        status: "revoked",
        blockchain: {
          txHash,
          type: "credential_revoke",
          timestamp: transactionTimestamp,
        },
      },
      { new: true }
    ).lean();

    await CredentialShare.updateMany(
      { credentialId, status: { $ne: "revoked" } },
      { status: "revoked" }
    );

    res.json({
      message: "Credential revoked successfully",
      txHash,
      record: credentialRecord,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/credentials", async (req, res, next) => {
  try {
    const { ownerAddress, status, limit } = req.query;
    const query = {};

    if (ownerAddress) {
      if (typeof ownerAddress !== "string" || !ownerAddress.trim()) {
        return badRequest(
          res,
          "ownerAddress must be a non-empty string when provided"
        );
      }
      query.ownerAddress = ownerAddress.trim();
    }

    if (status) {
      const allowedStatuses = ["active", "revoked"];
      if (!allowedStatuses.includes(status)) {
        return badRequest(
          res,
          "status must be one of active or revoked when provided"
        );
      }
      query.status = status;
    }

    const parsedLimit = Number(limit) || 50;
    const pageSize = Math.min(Math.max(parsedLimit, 1), 100);

    const credentialRecords = await Credential.find(query)
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .lean();

    const response = {
      count: credentialRecords.length,
      credentialRecords,
    };

    if (query.ownerAddress) {
      response.chainCredentials = blockchainService.getCredentialsByOwner(
        query.ownerAddress
      );
    }

    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.get("/credentials/:ownerAddress", async (req, res, next) => {
  try {
    const { ownerAddress } = req.params;
    const chainCredentials =
      blockchainService.getCredentialsByOwner(ownerAddress);
    const credentialRecords = await Credential.find({ ownerAddress })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ ownerAddress, chainCredentials, credentialRecords });
  } catch (error) {
    next(error);
  }
});

const { adminOnly } = require("../middleware/roles");

router.post("/organization/verify", adminOnly, async (req, res, next) => {
  try {
    const { orgAddress, metadata = {} } = req.body;

    if (!orgAddress) {
      return badRequest(res, "Organization address is required");
    }

    blockchainService.verifyOrganization(orgAddress);

    const organization = await Organization.findOneAndUpdate(
      { address: orgAddress },
      { address: orgAddress, verified: true, verifiedAt: new Date(), metadata },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    res
      .status(201)
      .json({ message: "Organization verified successfully", organization });
  } catch (error) {
    next(error);
  }
});

router.get("/organizations", async (req, res, next) => {
  try {
    const { verified, limit } = req.query;
    const query = {};

    if (typeof verified !== "undefined") {
      if (verified === "true" || verified === true) {
        query.verified = true;
      } else if (verified === "false" || verified === false) {
        query.verified = false;
      } else {
        return badRequest(res, "verified must be true or false when provided");
      }
    }

    const parsedLimit = Number(limit) || 100;
    const pageSize = Math.min(Math.max(parsedLimit, 1), 200);

    const organizations = await Organization.find(query)
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .lean();

    res.json({ count: organizations.length, organizations });
  } catch (error) {
    next(error);
  }
});

router.get("/organization/verify/:orgAddress", async (req, res, next) => {
  try {
    const { orgAddress } = req.params;
    if (!/^04[0-9a-fA-F]{128}$/.test(orgAddress)) {
      return badRequest(
        res,
        "orgAddress must be uncompressed secp256k1 public key hex"
      );
    }
    const isVerified = blockchainService.isOrganizationVerified(orgAddress);
    const organization = await Organization.findOne({
      address: orgAddress,
    }).lean();
    res.json({ orgAddress, verified: isVerified, organization });
  } catch (error) {
    next(error);
  }
});

router.get("/audit/:address", async (req, res, next) => {
  try {
    const { address } = req.params;
    const auditTrail = blockchainService.getAuditTrail(address);
    const [credentialRecords, shareRecords] = await Promise.all([
      Credential.find({ ownerAddress: address }).lean(),
      CredentialShare.find({
        $or: [{ fromAddress: address }, { toAddress: address }],
      }).lean(),
    ]);

    res.json({ address, auditTrail, credentialRecords, shareRecords });
  } catch (error) {
    next(error);
  }
});

router.post("/nodes/register", adminOnly, (req, res, next) => {
  try {
    const { nodes } = req.body;

    if (!Array.isArray(nodes) || !nodes.length) {
      return badRequest(res, "Nodes array is required");
    }

    nodes.forEach((node) => blockchainService.addNode(node));
    res.status(201).json({ message: "Nodes registered successfully" });
  } catch (error) {
    next(error);
  }
});

router.get("/nodes", (req, res) => {
  res.json({ nodes: blockchainService.getNodes() });
});

router.get("/consensus", (req, res) => {
  const valid = blockchainService.resolveConflicts();
  res.json({
    message: valid ? "Consensus resolved" : "No conflicts found",
    valid,
  });
});

router.get("/address/:address/balance", (req, res, next) => {
  try {
    const { address } = req.params;
    if (typeof address !== "string" || !address.trim()) {
      return badRequest(res, "Address is required");
    }
    if (!/^04[0-9a-fA-F]{128}$/.test(address.trim())) {
      return badRequest(
        res,
        "address must be uncompressed secp256k1 public key hex"
      );
    }

    const balance = blockchainService.getBalance(address.trim());
    const credentials = blockchainService.getCredentialsByOwner(address.trim());

    res.json({ address: address.trim(), balance, credentials });
  } catch (error) {
    next(error);
  }
});

router.get("/address/generate", (req, res) => {
  res.json({ address: blockchainService.generateAddress() });
});

module.exports = router;
