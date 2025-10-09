const BlockDAG = require("../models/BlockDAG");
const CredentialContract = require("../contracts/CredentialContract");
const Transaction = require("../models/Transaction");

class BlockchainService {
  constructor({ enableP2P = false } = {}) {
    this.dag = new BlockDAG();
    this.credentialContract = new CredentialContract();
    this.nodes = new Set();
    this.nodeAddress = this.generateNodeAddress();
    this.p2p = null;

    // Apply transactions to contract state when blocks are accepted
    this.dag.addBlockListener((block) => this.applyBlock(block));

    if (enableP2P) {
      const P2P = require("../network/P2P");
      this.p2p = new P2P(this.dag);
      this.p2p.start();
    }
  }

  generateNodeAddress() {
    return "node_" + Math.random().toString(36).substr(2, 9);
  }

  // Generate an address as uncompressed secp256k1 public key hex (starts with 04, 130 chars)
  generateAddress() {
    const { ec: EC } = require("elliptic");
    const ec = new EC("secp256k1");
    const kp = ec.genKeyPair();
    return kp.getPublic("hex");
  }

  validateAddress(address) {
    return typeof address === "string" && /^04[0-9a-fA-F]{128}$/.test(address);
  }

  // Transaction methods
  createTransaction({
    fromAddress,
    toAddress,
    amount,
    data = null,
    type = "transfer",
    timestamp = Date.now(),
    signature = null,
    nonce = 0,
    fee = 0,
  }) {
    return new Transaction(
      fromAddress,
      toAddress,
      amount,
      data,
      type,
      timestamp,
      signature,
      nonce,
      fee
    );
  }

  addTransaction(transaction) {
    this.dag.addTransaction(transaction);
    if (this.p2p) this.p2p.announceTx(transaction);
    return transaction;
  }

  getPendingTransactions() {
    return this.dag.getPendingTransactions();
  }

  async minePendingTransactions(miningRewardAddress) {
    const block = await this.dag.minePendingTransactions(miningRewardAddress);
    if (this.p2p) this.p2p.announceBlock(block);
    return block;
  }

  clearPendingTransactions() {
    this.dag.clearPendingTransactions();
  }

  // Apply a block's transactions to contract state
  applyBlock(block) {
    if (!block || !Array.isArray(block.transactions)) return;
    for (const tx of block.transactions) {
      try {
        switch (tx.type) {
          case 'credential_store': {
            const { credentialHash, metadata = {} } = tx.data || {};
            if (tx.fromAddress && credentialHash) {
              this.credentialContract.storeCredential(tx.fromAddress, credentialHash, metadata);
            }
            break;
          }
          case 'credential_share': {
            const { credentialId, expiryHours = 24 } = tx.data || {};
            if (credentialId && tx.fromAddress && tx.toAddress) {
              this.credentialContract.shareCredential(credentialId, tx.fromAddress, tx.toAddress, Number(expiryHours) || 24);
            }
            break;
          }
          case 'credential_revoke': {
            const { credentialId } = tx.data || {};
            if (credentialId && tx.fromAddress) {
              this.credentialContract.revokeCredential(credentialId, tx.fromAddress);
            }
            break;
          }
          case 'organization_verify': {
            if (tx.toAddress) {
              this.credentialContract.verifyOrganization(tx.toAddress);
            }
            break;
          }
          default:
            break;
        }
      } catch (_) {}
    }
  }

  // Credential contract methods
  storeCredential(ownerAddress, credentialHash, metadata = {}) {
    return this.credentialContract.storeCredential(
      ownerAddress,
      credentialHash,
      metadata
    );
  }

  verifyCredential(credentialId, ownerAddress) {
    return this.credentialContract.verifyCredential(credentialId, ownerAddress);
  }

  shareCredential(credentialId, fromAddress, toAddress, expiryHours = 24) {
    return this.credentialContract.shareCredential(
      credentialId,
      fromAddress,
      toAddress,
      expiryHours
    );
  }

  verifyOrganization(orgAddress) {
    return this.credentialContract.verifyOrganization(orgAddress);
  }

  isOrganizationVerified(orgAddress) {
    return this.credentialContract.isOrganizationVerified(orgAddress);
  }

  revokeCredential(credentialId, ownerAddress) {
    return this.credentialContract.revokeCredential(credentialId, ownerAddress);
  }

  getAuditTrail(address) {
    return this.credentialContract.getAuditTrail(address);
  }

  getCredentialsByOwner(ownerAddress) {
    return this.credentialContract.getCredentialsByOwner(ownerAddress);
  }

  getShare(shareId) {
    return this.credentialContract.getShare(shareId);
  }

  getSharesForAddress(address) {
    return this.credentialContract.getSharesForAddress(address);
  }

  verifyShareAccess(shareId, requestingAddress) {
    return this.credentialContract.verifyShareAccess(shareId, requestingAddress);
  }

  // Blockchain info methods
  getChain() {
    return this.dag.chain;
  }

  getLatestBlock() {
    return this.dag.getLatestBlock();
  }

  getBalance(address) {
    return this.dag.getBalanceOfAddress(address);
  }

  isChainValid() {
    return this.dag.isChainValid();
  }

  getTips() {
    return this.dag.getTips();
  }

  // P2P network methods (simplified)
  addNode(nodeUrl) {
    this.nodes.add(nodeUrl);
  }

  getNodes() {
    return Array.from(this.nodes);
  }

  // Consensus methods
  resolveConflicts() {
    return this.dag.isChainValid();
  }

  // Utility methods kept above: generateAddress() and validateAddress()
}

module.exports = BlockchainService;
