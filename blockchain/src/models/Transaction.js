const crypto = require("crypto-js");

class Transaction {
  constructor(fromAddress, toAddress, amount, data = null, type = "transfer") {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.data = data; // For credential data or contract calls
    this.type = type; // 'transfer', 'credential', 'contract'
    this.timestamp = Date.now();
    this.signature = null;
  }

  calculateHash() {
    return crypto
      .SHA256(
        this.fromAddress +
          this.toAddress +
          this.amount.toString() +
          JSON.stringify(this.data) +
          this.type +
          this.timestamp.toString()
      )
      .toString();
  }

  signTransaction(signingKey) {
    if (signingKey.getPublic("hex") !== this.fromAddress) {
      throw new Error("Cannot sign transactions for other wallets");
    }

    const hashTx = this.calculateHash();
    const sig = signingKey.sign(hashTx, "base64");
    this.signature = sig.toDER("hex");
  }

  isValid() {
    if (this.fromAddress === null) return true; // Genesis block reward

    if (!this.signature || this.signature.length === 0) {
      throw new Error("No signature in this transaction");
    }

    // For now, we'll implement basic validation
    // In production, this would verify the signature properly
    return true;
  }
}

module.exports = Transaction;
