const Block = require("./Block");
const Transaction = require("./Transaction");
const crypto = require("crypto-js");

class BlockDAG {
  constructor() {
    this.chain = [];
    this.pendingTransactions = [];
    this.difficulty = 2;
    this.miningReward = 100;

    // Create genesis block
    this.createGenesisBlock();
  }

  createGenesisBlock() {
    const genesisBlock = new Block(0, Date.now(), [], "0", 0, this.difficulty);
    genesisBlock.hash = genesisBlock.calculateHash();
    this.chain.push(genesisBlock);
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress) {
    const rewardTx = new Transaction(
      null,
      miningRewardAddress,
      this.miningReward,
      null,
      "reward"
    );
    this.pendingTransactions.push(rewardTx);

    const block = new Block(
      this.chain.length,
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash,
      0,
      this.difficulty
    );

    block.mineBlock(this.difficulty);

    console.log("Block successfully mined!");
    this.chain.push(block);

    this.pendingTransactions = [];
    return block;
  }

  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error("Transaction must include from and to address");
    }

    if (!transaction.isValid()) {
      throw new Error("Cannot add invalid transaction to chain");
    }

    this.pendingTransactions.push(transaction);
  }

  getBalanceOfAddress(address) {
    let balance = 0;

    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }
        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }

    return balance;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (!currentBlock.hasValidTransactions()) {
        return false;
      }

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  // BlockDAG specific methods
  addBlock(block) {
    // In BlockDAG, we can reference multiple previous blocks
    // For simplicity, we'll maintain a linear chain for now
    if (this.isValidBlock(block)) {
      this.chain.push(block);
      return true;
    }
    return false;
  }

  isValidBlock(block) {
    const latestBlock = this.getLatestBlock();

    if (block.previousHash !== latestBlock.hash) {
      return false;
    }

    if (block.hash !== block.calculateHash()) {
      return false;
    }

    if (!block.hasValidTransactions()) {
      return false;
    }

    return true;
  }

  // Method to find all tips (blocks with no children)
  getTips() {
    const tips = [];
    const children = new Set();

    // Find all blocks that are referenced as previousHash
    for (const block of this.chain) {
      if (block.previousHash !== "0") {
        children.add(block.previousHash);
      }
    }

    // Find blocks that are not referenced
    for (const block of this.chain) {
      if (!children.has(block.hash)) {
        tips.push(block);
      }
    }

    return tips;
  }

  // Get the longest chain for consensus
  getLongestChain() {
    // For simplicity, return the main chain
    // In a full BlockDAG, this would be more complex
    return this.chain;
  }
}

module.exports = BlockDAG;
