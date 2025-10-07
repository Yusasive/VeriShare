const crypto = require("crypto-js");

class Block {
  constructor(
    index,
    timestamp,
    transactions,
    previousHash = "",
    nonce = 0,
    difficulty = 2
  ) {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = nonce;
    this.difficulty = difficulty;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .SHA256(
        this.index +
          this.previousHash +
          this.timestamp +
          JSON.stringify(this.transactions) +
          this.nonce +
          this.difficulty
      )
      .toString();
  }

  mineBlock(difficulty) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(`Block mined: ${this.hash}`);
  }

  hasValidTransactions() {
    for (const tx of this.transactions) {
      if (!tx.isValid()) {
        return false;
      }
    }
    return true;
  }
}

module.exports = Block;
