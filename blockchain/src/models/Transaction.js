const crypto = require("crypto-js");
const { ec: EC } = require("elliptic");

const ec = new EC("secp256k1");

class Transaction {
  constructor(
    fromAddress,
    toAddress,
    amount,
    data = null,
    type = "transfer",
    timestamp = Date.now(),
    signature = null,
    nonce = 0,
    fee = 0
  ) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.data = data; // For credential data or contract calls
    this.type = type; // 'transfer', 'credential', 'contract', 'reward'
    this.timestamp = timestamp;
    this.signature = signature;
    this.nonce = Number.isFinite(nonce) ? Number(nonce) : 0;
    this.fee = Number.isFinite(fee) ? Number(fee) : 0;
  }

  calculateHash() {
    return crypto
      .SHA256(
        this.fromAddress +
          this.toAddress +
          this.amount.toString() +
          JSON.stringify(this.data) +
          this.type +
          this.timestamp.toString() +
          this.nonce.toString() +
          this.fee.toString()
      )
      .toString();
  }

  signTransaction(signingKey) {
    if (!signingKey || typeof signingKey.getPublic !== "function") {
      throw new Error("A valid elliptic key pair is required to sign transactions");
    }

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

    const publicKey = ec.keyFromPublic(this.fromAddress, "hex");
    return publicKey.verify(this.calculateHash(), this.signature);
  }
}

module.exports = Transaction;
