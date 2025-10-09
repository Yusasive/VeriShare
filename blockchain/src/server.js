const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const { BlockchainService } = require('./index');

const app = express();
app.use(express.json());

const svc = new BlockchainService({ enableP2P: true });

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.get("/info", (req, res) => res.json({ name: "verishare-blockchain", version: "1.0.0", tips: (svc.dag.getTips()||[]).length }));

const PORT = Number(process.env.PORT) || 8545;
app.listen(PORT, () => console.log(`Blockchain node HTTP running on :${PORT}`));
