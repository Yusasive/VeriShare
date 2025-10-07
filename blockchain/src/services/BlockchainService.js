const BlockDAG = require("../models/BlockDAG");
const CredentialContract = require("../contracts/CredentialContract");
const Transaction = require("../models/Transaction");

class BlockchainService {
  constructor() {
    this.dag = new BlockDAG();
    this.credentialContract = new CredentialContract();
    this.nodes = new Set();
    this.nodeAddress = this.generateNodeAddress();
  }

  generateNodeAddress() {
    return "node_" + Math.random().toString(36).substr(2, 9);
  }

  // Transaction methods
  createTransaction(
    fromAddress,
    toAddress,
    amount,
    data = null,
    type = "transfer"
  ) {
    const transaction = new Transaction(
      fromAddress,
      toAddress,
      amount,
      data,
      type
    );
    return transaction;
  }

  addTransaction(transaction) {
    this.dag.addTransaction(transaction);
    return transaction;
  }

  minePendingTransactions(miningRewardAddress) {
    const block = this.dag.minePendingTransactions(miningRewardAddress);
    return block;
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
    // Simplified consensus - in real implementation would compare chain lengths
    return this.dag.isChainValid();
  }

  // Utility methods
  generateAddress() {
    return "addr_" + Math.random().toString(36).substr(2, 16);
  }

  validateAddress(address) {
    return address.startsWith("addr_") && address.length === 22;
  }
}

module.exports = BlockchainService;
