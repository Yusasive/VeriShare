const mongoose = require("mongoose");

const ConsentRequestSchema = new mongoose.Schema(
  {
    requestId: {
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
    ownerAddress: {
      type: String,
      required: true,
      index: true,
    },
    organizationAddress: {
      type: String,
      required: true,
      index: true,
    },
    requestedData: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "denied", "expired"],
      default: "pending",
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    decisionAt: {
      type: Date,
    },
    reason: {
      type: String,
      default: "",
    },
    auditTrail: {
      type: [Object],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

ConsentRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("ConsentRequest", ConsentRequestSchema);
