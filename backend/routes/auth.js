const express = require("express");
const express = require("express");
const { randomBytes, createHash, randomUUID } = require("crypto");
const jwt = require("jsonwebtoken");
const { ec: EC } = require("elliptic");
const Wallet = require("../models/Wallet");
const AuthChallenge = require("../models/AuthChallenge");
const config = require("../config/config");
const auth = require("../middleware/auth");

const router = express.Router();
const ec = new EC("secp256k1");

const badRequest = (res, message) => res.status(400).json({ error: message });

router.post("/register", async (req, res, next) => {
  try {
    const { address, publicKey, encryptedPrivateKey, authSecretHash, recoveryEmail = "", recoveryPhone = "", metadata = {}, devices = [] } = req.body;

    if (!address || !publicKey || !encryptedPrivateKey || !authSecretHash) {
      return badRequest(res, "address, publicKey, encryptedPrivateKey, authSecretHash are required");
    }

    if (address !== publicKey) {
      return badRequest(res, "address must equal publicKey (uncompressed secp256k1 hex)");
    }
    if (!/^04[0-9a-fA-F]{128}$/.test(address)) {
      return badRequest(res, "address must be uncompressed secp256k1 public key hex (130 chars starting with 04)");
    }

    const existing = await Wallet.findOne({ address }).lean();
    if (existing) {
      return badRequest(res, "Wallet already registered");
    }

    const wallet = await Wallet.create({
      address,
      publicKey,
      encryptedPrivateKey,
      authSecretHash,
      recoveryEmail,
      recoveryPhone,
      metadata,
      devices,
      status: "active",
    });

    res.status(201).json({ message: "Registered", wallet: { id: wallet._id, address: wallet.address, publicKey: wallet.publicKey } });
  } catch (err) {
    next(err);
  }
});

router.post("/challenge", async (req, res, next) => {
  try {
    const { address } = req.body;
    if (!address) return badRequest(res, "address is required");

    const wallet = await Wallet.findOne({ address });
    if (!wallet) return badRequest(res, "Wallet not found");

    const nonce = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const challenge = await AuthChallenge.create({
      wallet: wallet._id,
      address,
      nonce,
      expiresAt,
      ipAddress: req.ip || "",
      userAgent: req.headers["user-agent"] || "",
    });

    res.status(201).json({ requestId: challenge._id, address, nonce, expiresAt });
  } catch (err) {
    next(err);
  }
});

router.post("/verify", async (req, res, next) => {
  try {
    const { address, signature } = req.body;
    if (!address || !signature) return badRequest(res, "address and signature are required");

    const wallet = await Wallet.findOne({ address });
    if (!wallet) return badRequest(res, "Wallet not found");

    const challenge = await AuthChallenge.findOne({ address, resolvedAt: { $exists: false }, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
    if (!challenge) return badRequest(res, "No active challenge for address");

    const msgHash = createHash("sha256").update(challenge.nonce).digest("hex");
    const pub = ec.keyFromPublic(wallet.publicKey, "hex");
    const isValid = pub.verify(msgHash, signature);

    if (!isValid) return res.status(401).json({ error: "Invalid signature" });

    challenge.resolvedAt = new Date();
    await challenge.save();

    wallet.lastAuthenticatedAt = new Date();
    await wallet.save();

    const token = jwt.sign({ sub: wallet._id.toString(), address: wallet.address }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

    res.json({ token, expiresIn: config.jwt.expiresIn });
  } catch (err) {
    next(err);
  }
});

router.get("/me", auth, async (req, res, next) => {
  try {
    const wallet = await Wallet.findById(req.user.id).select("-encryptedPrivateKey -authSecretHash");
    if (!wallet) return res.status(404).json({ error: "Not found" });
    res.json({ wallet });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
