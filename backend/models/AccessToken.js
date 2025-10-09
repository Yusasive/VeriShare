const mongoose = require("mongoose");

const AccessTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    requestId: { type: String, required: true, index: true },
    createdBy: { type: String, required: true, index: true }, // org address
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date },
    revoked: { type: Boolean, default: false, index: true },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

AccessTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("AccessToken", AccessTokenSchema);
