const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

dotenv.config();

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use(limiter);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const allowedOrigins = (process.env.CORS_ORIGIN || "*")
        .split(",")
        .map((value) => value.trim());

      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

mongoose.set("strictQuery", true);

const connectDB = async () => {
  const connectionString =
    process.env.MONGO_URI ||
    process.env.DATABASE_URL ||
    "mongodb://localhost:27017/verishare";

  try {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

mongoose.connection.on("error", (error) => {
  console.error("MongoDB error:", error.message);
});

const authRoutes = require("./routes/auth");
const consentRoutes = require("./routes/consent");
const complianceRoutes = require("./routes/compliance");
const organizationRoutes = require("./routes/organization");
const evmRoutes = require("./routes/evm");
const evmListRoutes = require("./routes/evm.list");
const authEvmRoutes = require("./routes/auth-evm");

app.get("/", (req, res) => {
  res.json({ message: "VeriShare Backend API is running" });
});
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Swagger UI
try {
  const swaggerUi = require("swagger-ui-express");
  const YAML = require("yamljs");
  const path = require("path");
  const candidates = [
    path.resolve(__dirname, "../docs/openapi.yaml"),
    path.resolve("docs/openapi.yaml"),
    path.resolve(__dirname, "docs/openapi.yaml"),
  ];
  let openapi;
  for (const p of candidates) {
    try {
      openapi = YAML.load(p);
      break;
    } catch {}
  }
  if (openapi) {
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));
  }
} catch (_) {
  // ignore if dependencies not installed
}

app.use("/api/auth", authRoutes);
app.use("/api/consent", consentRoutes);
app.use("/api/compliance", complianceRoutes);
app.use("/api/organization", organizationRoutes);
app.use("/api/evm", evmRoutes);
app.use("/api/evm", evmListRoutes);
app.use("/api/auth/evm", authEvmRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  console.error(err);
  res.status(status).json({ message });
});

const PORT = Number(process.env.PORT) || 5000;
let server;

const startServer = async () => {
  await connectDB();

  try {
    const { startSchedulers } = require("./jobs/scheduler");
    startSchedulers();
  } catch (_) {}

  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  return server;
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}

const shutdown = async (signal) => {
  try {
    console.log(`${signal} received, shutting down`);
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await mongoose.connection.close(false);
  } catch (err) {
    console.error("Error during shutdown", err);
  } finally {
    process.exit(0);
  }
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception", err);
  shutdown("uncaughtException");
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection", reason);
  shutdown("unhandledRejection");
});

module.exports = { app, connectDB, startServer };
