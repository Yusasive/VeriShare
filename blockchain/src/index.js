// VeriShare Blockchain Library
// Exports core blockchain services for use by the backend API

const BlockchainService = require("./services/BlockchainService");
const CredentialContract = require("./contracts/CredentialContract");
const { Block } = require("./models/Block");
const { Transaction } = require("./models/Transaction");

module.exports = {
  BlockchainService,
  CredentialContract,
  Block,
  Transaction,
};
