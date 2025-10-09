const WebSocket = require('ws');

const MSG = {
  HELLO: 'hello',
  REQUEST_CHAIN: 'request_chain',
  CHAIN: 'chain',
  NEW_BLOCK: 'new_block',
  NEW_TX: 'new_tx',
};

class P2P {
  constructor(dag, opts = {}) {
    this.dag = dag;
    this.port = Number(process.env.WS_PORT || opts.port || 8546);
    this.peers = new Set();
    this.server = null;
  }

  start() {
    this.server = new WebSocket.Server({ port: this.port });
    this.server.on('connection', (ws) => this._initConnection(ws));
    const seed = (process.env.PEERS || '').split(',').map((s) => s.trim()).filter(Boolean);
    seed.forEach((url) => this.connect(url));
    console.log(`P2P listening on :${this.port}`);
  }

  connect(url) {
    const ws = new WebSocket(url);
    ws.on('open', () => this._initConnection(ws));
    ws.on('error', () => ws.close());
  }

  _initConnection(ws) {
    this.peers.add(ws);
    ws.on('message', (data) => this._onMessage(ws, data));
    ws.on('close', () => this.peers.delete(ws));
    this._send(ws, { type: MSG.HELLO, tips: this.dag.getTips().map((b) => b.hash) });
    this._send(ws, { type: MSG.REQUEST_CHAIN });
  }

  _send(ws, msg) {
    try { ws.send(JSON.stringify(msg)); } catch {}
  }

  _broadcast(msg) {
    const data = JSON.stringify(msg);
    for (const ws of this.peers) {
      try { ws.send(data); } catch {}
    }
  }

  _onMessage(ws, data) {
    let msg;
    try { msg = JSON.parse(data.toString()); } catch { return; }

    switch (msg.type) {
      case MSG.REQUEST_CHAIN: {
        const chain = this.dag.getChain();
        this._send(ws, { type: MSG.CHAIN, chain });
        break;
      }
      case MSG.CHAIN: {
        // naive sync: accept each block if valid
        for (const raw of msg.chain || []) {
          if (!raw || !raw.hash) continue;
          const Block = require('../models/Block');
          const blk = Object.assign(new Block(), raw);
          blk.calculateHash = Block.prototype.calculateHash;
          blk.mineBlock = Block.prototype.mineBlock;
          blk.hasValidTransactions = Block.prototype.hasValidTransactions;
          try { this.dag.addBlock(blk); } catch {}
        }
        break;
      }
      case MSG.NEW_BLOCK: {
        const Block = require('../models/Block');
        const blk = Object.assign(new Block(), msg.block);
        blk.calculateHash = Block.prototype.calculateHash;
        blk.mineBlock = Block.prototype.mineBlock;
        blk.hasValidTransactions = Block.prototype.hasValidTransactions;
        try { this.dag.addBlock(blk); } catch {}
        break;
      }
      case MSG.NEW_TX: {
        const Transaction = require('../models/Transaction');
        const tx = Object.assign(new Transaction(), msg.tx);
        try { this.dag.addTransaction(tx); } catch {}
        break;
      }
      default:
        break;
    }
  }

  announceBlock(block) {
    this._broadcast({ type: MSG.NEW_BLOCK, block });
  }

  announceTx(tx) {
    this._broadcast({ type: MSG.NEW_TX, tx });
  }
}

module.exports = P2P;
