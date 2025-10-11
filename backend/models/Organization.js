const mongoose = require("mongoose");

const OrganizationSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    domain: {
      type: String,
      trim: true,
      default: "",
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    verified: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      type: Object,
      default: {},
    },
    documents: {
      type: [String],
      default: [],
    },
    reviewNotes: {
      type: String,
      default: "",
    },
    appliedAt: {
      type: Date,
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Organization", OrganizationSchema);
