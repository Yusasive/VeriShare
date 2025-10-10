const auth = require("./auth");
const auth = require("./auth");
const config = require("../config/config");

function isAdminAddress(address) {
  if (!address) return false;
  return config.admin.addresses.includes(address);
}

function adminOnly(req, res, next) {
  // Ensure authenticated first
  return auth(req, res, () => {
    if (!isAdminAddress(req.user.address)) {
      return res.status(403).json({ error: "Admin privileges required" });
    }
    return next();
  });
}

module.exports = { isAdminAddress, adminOnly };
