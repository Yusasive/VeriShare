const mongoose = require("mongoose");

const AddressStateSchema = new mongoose.Schema(
  {
    address: { type: String, required: true, unique: true, index: true },
    lastNonce: { type: Number, default: 0, index: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AddressState", AddressStateSchema);
