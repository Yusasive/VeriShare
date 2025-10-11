const ConsentRequest = require("../models/ConsentRequest");

function startSchedulers() {
  // Every minute: expire shares and consent requests
  setInterval(async () => {
    try {
      await CredentialShare.updateMany(
        { status: "active", expiryTime: { $lte: new Date() } },
        { status: "expired" }
      );
      await ConsentRequest.updateMany(
        { status: "pending", expiresAt: { $lte: new Date() } },
        { status: "expired" }
      );
    } catch (e) {
      // silent
    }
  }, 60 * 1000);
}

module.exports = { startSchedulers };
