const fs = require("fs");
const path = require("path");
const { addBuffer } = require("../services/ipfsService");

(async () => {
  try {
    const filePath = path.join(__dirname, "sample.png"); // place a small image here
    const buffer = fs.readFileSync(filePath);

    const cid = await addBuffer(buffer, "sample.png");
    console.log("✅ File uploaded successfully!");
    console.log("📦 CID:", cid);
    console.log("🌐 View it at: https://gateway.pinata.cloud/ipfs/" + cid);
  } catch (err) {
    console.error("❌ Upload failed:", err.message);
  }
})();
