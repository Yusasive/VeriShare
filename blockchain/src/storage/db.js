const levelup = require('levelup');
const leveldown = require('leveldown');
const path = require('path');

class DB {
  constructor(dbPath) {
    const full = path.resolve(dbPath || './data/blockchain.db');
    this.db = levelup(leveldown(full));
  }

  async getJSON(key, fallback = null) {
    try {
      const val = await this.db.get(key);
      return JSON.parse(val.toString());
    } catch (e) {
      if (e.notFound) return fallback;
      throw e;
    }
  }

  async putJSON(key, value) {
    return this.db.put(key, JSON.stringify(value));
  }

  async del(key) {
    return this.db.del(key);
  }
}

module.exports = DB;
