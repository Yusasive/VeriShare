const mongoose = require("mongoose");

const DeviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      default: "",
    },
    appVersion: {
      type: String,
      default: "",
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  { _id: false }
);

const WalletSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    publicKey: {
      type: String,
      required: true,
    },
    encryptedPrivateKey: {
      type: String,
      required: true,
    },
    authSecretHash: {
      type: String,
      required: true,
    },
    recoveryEmail: {
      type: String,
      default: "",
    },
    recoveryPhone: {
      type: String,
      default: "",
    },
    metadata: {
      type: Object,
      default: {},
    },
    devices: {
      type: [DeviceSchema],
      default: [],
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
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Wallet", WalletSchema);
