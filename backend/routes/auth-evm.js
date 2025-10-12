const express = require("express");
const { randomBytes } = require("crypto");
const jwt = require("jsonwebtoken");
const { ethers } = require("ethers");
const EvmWallet = require("../models/EvmWallet");
const EvmAuthChallenge = require("../models/EvmAuthChallenge");
const config = require("../config/config");
const auth = require("../middleware/auth");

const router = express.Router();

const badRequest = (res, message) => res.status(400).json({ error: message });

router.post("/register", async (req, res, next) => {
  try {
    const { address, chainId = "", metadata = {} } = req.body;
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return badRequest(res, "Valid EVM address required");
    }
    const addr = ethers.getAddress(address);

    let wallet = await EvmWallet.findOne({ address: addr });
    if (!wallet) {
      wallet = await EvmWallet.create({ address: addr, chainId: String(chainId || ""), metadata, status: "active" });
    }
    return res.status(201).json({ message: "Registered", wallet: { id: wallet._id, address: wallet.address } });
  } catch (err) {
    next(err);
  }
});

router.post("/challenge", async (req, res, next) => {
  try {
    const { address } = req.body;
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) return badRequest(res, "Valid EVM address required");
    const addr = ethers.getAddress(address);

    let wallet = await EvmWallet.findOne({ address: addr });
    if (!wallet) {
      wallet = await EvmWallet.create({ address: addr, status: "active" });
    }

    const nonce = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const challenge = await EvmAuthChallenge.create({
      wallet: wallet._id,
      address: addr,
      nonce,
      expiresAt,
      ipAddress: req.ip || "",
      userAgent: req.headers["user-agent"] || "",
    });

    res.status(201).json({ requestId: challenge._id, address: addr, nonce, expiresAt });
  } catch (err) {
    next(err);
  }
});

router.post("/verify", async (req, res, next) => {
  try {
    const { address, signature } = req.body;
    if (!address || !signature) return badRequest(res, "address and signature are required");
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return badRequest(res, "Valid EVM address required");

    const addr = ethers.getAddress(address);
    const wallet = await EvmWallet.findOne({ address: addr });
    if (!wallet) return badRequest(res, "Wallet not found");

    const challenge = await EvmAuthChallenge.findOne({ address: addr, resolvedAt: { $exists: false }, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
    if (!challenge) return badRequest(res, "No active challenge for address");

    const recovered = ethers.verifyMessage(challenge.nonce, signature);
    const recAddr = ethers.getAddress(recovered);
    if (recAddr !== addr) return res.status(401).json({ error: "Invalid signature" });

    challenge.resolvedAt = new Date();
    await challenge.save();

    wallet.lastAuthenticatedAt = new Date();
    await wallet.save();

    const token = jwt.sign({ sub: wallet._id.toString(), address: wallet.address, evm: true }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

    res.json({ token, expiresIn: config.jwt.expiresIn });
  } catch (err) {
    next(err);
  }
});

router.get("/me", auth, async (req, res, next) => {
  try {
    const wallet = await EvmWallet.findById(req.user.id);
    if (!wallet) return res.status(404).json({ error: "Not found" });
    res.json({ wallet: { id: wallet._id, address: wallet.address, chainId: wallet.chainId } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
