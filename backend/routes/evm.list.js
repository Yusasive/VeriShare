const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Credential = require("../models/Credential");

// List all credentials for a given owner (or all if no filter)
router.get("/credential/list", auth, async (req, res) => {
  try {
    // Optionally filter by ownerAddress via query param
    const filter = {};
    if (req.query.ownerAddress) {
      filter.ownerAddress = req.query.ownerAddress;
    }
    const credentials = await Credential.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, credentials });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
