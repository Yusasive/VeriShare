const axios = require("axios");

const IPFS_API_URL = process.env.IPFS_API_URL || "";
const IPFS_API_KEY = process.env.IPFS_API_KEY || "";

async function addBuffer(buffer) {
  if (!IPFS_API_URL) {
    throw new Error("IPFS_API_URL not configured");
  }
  const res = await axios.post(`${IPFS_API_URL}/api/v0/add`, buffer, {
    headers: {
      "Content-Type": "application/octet-stream",
      ...(IPFS_API_KEY ? { Authorization: `Bearer ${IPFS_API_KEY}` } : {}),
    },
    maxBodyLength: Infinity,
  });
  const lines = res.data.toString().trim().split("\n");
  const last = JSON.parse(lines[lines.length - 1]);
  return last.Hash;
}

async function addJSON(obj) {
  const data = Buffer.from(JSON.stringify(obj));
  return addBuffer(data);
}

module.exports = { addBuffer, addJSON };
