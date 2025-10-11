const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  corsOrigin: process.env.CORS_ORIGIN || "*",
  mongoUri:
    process.env.MONGO_URI || process.env.DATABASE_URL || "mongodb://localhost:27017/verishare",
  jwt: {
    secret: process.env.JWT_SECRET || "change-me-in-prod",
    expiresIn: process.env.JWT_EXPIRES_IN || "12h",
  },
  admin: {
    addresses: (process.env.ADMIN_ADDRESSES || "")
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean),
  },
};
