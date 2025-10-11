// backend/services/ipfsService.js
const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();

const PINATA_JWT = process.env.PINATA_JWT;

if (!PINATA_JWT) {
  throw new Error("❌ Missing PINATA_JWT in your .env file");
}

async function addBuffer(buffer, name = "file") {
  const formData = new FormData();
  formData.append("file", buffer, name);

  try {
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
          ...formData.getHeaders(),
        },
        maxBodyLength: Infinity,
      }
    );

    return res.data.IpfsHash;
  } catch (error) {
    console.error(
      "❌ Pinata upload error:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function addJSON(obj) {
  try {
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      obj,
      {
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data.IpfsHash;
  } catch (error) {
    console.error(
      "❌ Pinata JSON upload error:",
      error.response?.data || error.message
    );
    throw error;
  }
}

module.exports = { addBuffer, addJSON };
