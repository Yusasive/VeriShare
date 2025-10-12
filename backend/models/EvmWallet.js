const mongoose = require("mongoose");

const EvmWalletSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    chainId: {
      type: String,
      default: "",
    },
    metadata: {
      type: Object,
      default: {},
    },
    lastAuthenticatedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "revoked", "suspended"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EvmWallet", EvmWalletSchema);
