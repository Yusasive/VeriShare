const BlockchainService = require("../src/services/BlockchainService");

async function initGenesis() {
  console.log("🚀 Initializing VeriShare BlockDAG Genesis Block...");

  const blockchainService = new BlockchainService();

  // Create some initial verified organizations
  const organizations = [
    "org_university_of_lagos",
    "org_national_youth_service_corps",
    "org_nigerian_immigration_service",
    "org_central_bank_of_nigeria",
  ];

  console.log("✅ Verifying initial organizations...");
  organizations.forEach((org) => {
    blockchainService.verifyOrganization(org);
    console.log(`   ✓ Verified: ${org}`);
  });

  // Mine the first block with genesis reward
  console.log("⛏️  Mining genesis block...");
  const genesisBlock =
    blockchainService.minePendingTransactions("genesis_miner");

  console.log("✅ Genesis block created successfully!");
  console.log(`   Block Hash: ${genesisBlock.hash}`);
  console.log(`   Transactions: ${genesisBlock.transactions.length}`);
  console.log(
    `   Timestamp: ${new Date(genesisBlock.timestamp).toISOString()}`
  );

  // Display blockchain info
  console.log("\n📊 Blockchain Status:");
  console.log(`   Chain Length: ${blockchainService.getChain().length}`);
  console.log(`   Latest Block: ${blockchainService.getLatestBlock().hash}`);
  console.log(`   Is Valid: ${blockchainService.isChainValid()}`);
  console.log(`   Verified Organizations: ${organizations.length}`);

  console.log("\n🎉 VeriShare BlockDAG Genesis initialization complete!");
}

initGenesis().catch(console.error);
