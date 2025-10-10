const mongoose = require("mongoose");

const mongoose = require("mongoose");

const CredentialSchema = new mongoose.Schema(
  {
    credentialId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    ownerAddress: {
      type: String,
      required: true,
      index: true,
    },
    credentialHash: {
      type: String,
      required: true,
    },
    metadata: {
      type: Object,
      default: {},
    },
    status: {
      type: String,
      enum: ["active", "revoked"],
      default: "active",
    },
    blockchain: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Credential", CredentialSchema);
