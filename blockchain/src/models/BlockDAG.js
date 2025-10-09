const Block = require("./Block");
const Transaction = require("./Transaction");
const DB = require("../storage/db");

class BlockDAG {
  constructor() {
    this.difficulty = Number(process.env.DIFFICULTY || 2);
    this.miningReward = Number(process.env.MINING_REWARD || 100);
    this.db = new DB(process.env.DB_PATH || "./data/blockchain.db");

    this.blocks = new Map(); // hash -> Block
    this.children = new Map(); // hash -> Set(childHash)
    this.pendingTransactions = [];
    this.tips = new Set();
    this._listeners = new Set();

    this._init().catch((e) => {
      console.error("DAG init error", e);
      throw e;
    });
  }

  async _init() {
    const savedTips = await this.db.getJSON("tips", null);
    const savedPending = await this.db.getJSON("pending_txs", []);

    // Load blocks by following tips back to genesis
    if (savedTips && savedTips.length) {
      for (const tip of savedTips) {
        await this._loadBlockRecursive(tip);
      }
      this.tips = new Set(savedTips);
      this.pendingTransactions = savedPending.map((t) => Object.assign(new Transaction(), t));
      return;
    }

    // Create genesis
    const genesis = new Block(0, Date.now(), [], "0", 0, this.difficulty, []);
    genesis.hash = genesis.calculateHash();
    await this._saveBlock(genesis);
    this.blocks.set(genesis.hash, genesis);
    this.children.set(genesis.hash, new Set());
    this.tips.add(genesis.hash);
    await this._persistMeta();
  }

  async _loadBlockRecursive(hash, visited = new Set()) {
    if (visited.has(hash)) return;
    const raw = await this.db.getJSON(`block:${hash}`, null);
    if (!raw) return; // tolerate missing
    const block = Object.assign(new Block(), raw);
    // Ensure methods present
    block.calculateHash = Block.prototype.calculateHash;
    block.mineBlock = Block.prototype.mineBlock;
    block.hasValidTransactions = Block.prototype.hasValidTransactions;

    this.blocks.set(hash, block);
    if (!this.children.has(hash)) this.children.set(hash, new Set());

    for (const p of block.parents || []) {
      if (!this.children.has(p)) this.children.set(p, new Set());
      this.children.get(p).add(hash);
      await this._loadBlockRecursive(p, visited);
    }
    visited.add(hash);
  }

  async _saveBlock(block) {
    await this.db.putJSON(`block:${block.hash}`, block);
  }

  async _persistMeta() {
    await this.db.putJSON("tips", Array.from(this.tips));
    await this.db.putJSON("pending_txs", this.pendingTransactions);
  }

  getPendingTransactions() {
    return [...this.pendingTransactions];
  }

  clearPendingTransactions() {
    this.pendingTransactions = [];
    return this._persistMeta();
  }

  addTransaction(transaction) {
    if (!(transaction instanceof Transaction)) {
      throw new Error("Invalid transaction object");
    }

    if (transaction.fromAddress !== null && (!transaction.signature || !transaction.isValid())) {
      throw new Error("Cannot add invalid transaction to pool");
    }

    this.pendingTransactions.push(transaction);
    this._persistMeta();
  }

  _selectParents() {
    // Select up to 2 current tips as parents
    const tips = Array.from(this.tips);
    if (tips.length === 0) return [];
    if (tips.length === 1) return [tips[0]];
    return tips.slice(0, 2);
  }

  async minePendingTransactions(miningRewardAddress) {
    if (!miningRewardAddress) throw new Error("Mining reward address is required");

    const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward, null, "reward");
    const txs = [...this.pendingTransactions, rewardTx];

    const parents = this._selectParents();
    const primary = parents[0] || "0";

    const block = new Block(
      this.blocks.size,
      Date.now(),
      txs,
      primary,
      0,
      this.difficulty,
      parents
    );

    block.mineBlock(this.difficulty);
    await this._acceptBlock(block);
    await this.clearPendingTransactions();
    return block;
  }

  addBlockListener(cb) {
    if (typeof cb === 'function') this._listeners.add(cb);
  }

  _notifyBlockAccepted(block) {
    for (const cb of this._listeners) {
      try { cb(block); } catch (e) { /* ignore */ }
    }
  }

  async _acceptBlock(block) {
    // Basic validation
    if (!block.hasValidTransactions()) throw new Error("Block has invalid transactions");
    if (block.hash !== block.calculateHash()) throw new Error("Invalid block hash");

    // Update parents/children map
    for (const p of block.parents) {
      if (!this.blocks.has(p)) throw new Error("Missing parent: " + p);
      if (!this.children.has(p)) this.children.set(p, new Set());
      this.children.get(p).add(block.hash);
      this.tips.delete(p);
    }

    this.blocks.set(block.hash, block);
    if (!this.children.has(block.hash)) this.children.set(block.hash, new Set());
    this.tips.add(block.hash);

    await this._saveBlock(block);
    await this._persistMeta();
    this._notifyBlockAccepted(block);
  }

  getLatestBlock() {
    // Choose best tip by height approximation (longest ancestry)
    let best = null;
    let bestHeight = -1;
    for (const tip of this.tips) {
      const h = this._heightOf(tip);
      if (h > bestHeight) {
        bestHeight = h;
        best = this.blocks.get(tip);
      }
    }
    return best;
  }

  _heightOf(hash, memo = new Map()) {
    if (memo.has(hash)) return memo.get(hash);
    const b = this.blocks.get(hash);
    if (!b || !b.parents || b.parents.length === 0) return 0;
    let maxP = 0;
    for (const p of b.parents) {
      maxP = Math.max(maxP, 1 + this._heightOf(p, memo));
    }
    memo.set(hash, maxP);
    return maxP;
  }

  getChain() {
    // Return a best-path chain from genesis to best tip
    const tip = this.getLatestBlock();
    if (!tip) return [];
    const path = [];
    const visit = (b) => {
      path.push(b);
      if (!b.parents || b.parents.length === 0) return;
      // pick parent with highest height
      let bestP = b.parents[0];
      let bestH = -1;
      for (const p of b.parents) {
        const h = this._heightOf(p);
        if (h > bestH) {
          bestH = h;
          bestP = p;
        }
      }
      visit(this.blocks.get(bestP));
    };
    visit(tip);
    return path.reverse();
  }

  isChainValid() {
    // Validate all blocks reachable from tips
    for (const [, block] of this.blocks) {
      if (block.hash !== block.calculateHash()) return false;
      if (!block.hasValidTransactions()) return false;
    }
    return true;
  }

  getTips() {
    return Array.from(this.tips).map((h) => this.blocks.get(h));
  }

  addBlock(block) {
    // Accept externally received block
    return this._acceptBlock(block);
  }

  getBalanceOfAddress(address) {
    let balance = 0;
    for (const [, block] of this.blocks) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) balance -= trans.amount;
        if (trans.toAddress === address) balance += trans.amount;
      }
    }
    return balance;
  }

  resolveConflicts() {
    // Placeholder: real implementation would compare with peers by cumulative work
    return this.isChainValid();
  }
}

module.exports = BlockDAG;
