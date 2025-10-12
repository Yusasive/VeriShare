const mongoose = require("mongoose");

const EvmAuthChallengeSchema = new mongoose.Schema(
  {
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EvmWallet",
      required: true,
    },
    address: {
      type: String,
      required: true,
      index: true,
    },
    nonce: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    resolvedAt: {
      type: Date,
    },
    ipAddress: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EvmAuthChallenge", EvmAuthChallengeSchema);
