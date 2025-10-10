const mongoose = require("mongoose");

const mongoose = require("mongoose");

const CredentialShareSchema = new mongoose.Schema(
  {
    shareId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    credentialId: {
      type: String,
      required: true,
      index: true,
    },
    fromAddress: {
      type: String,
      required: true,
      index: true,
    },
    toAddress: {
      type: String,
      required: true,
      index: true,
    },
    expiryTime: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "revoked"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CredentialShare", CredentialShareSchema);
