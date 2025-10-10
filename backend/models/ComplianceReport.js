const mongoose = require("mongoose");

const mongoose = require("mongoose");

const ComplianceReportSchema = new mongoose.Schema(
  {
    reportId: {
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
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    metrics: {
      type: Object,
      default: {},
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    generatedBy: {
      type: String,
      default: "system",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ComplianceReport", ComplianceReportSchema);
