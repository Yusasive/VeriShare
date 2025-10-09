const { BlockchainService } = require("../src");

async function initGenesis() {
  console.log("🚀 Initializing VeriShare BlockDAG Genesis Block...");

  const blockchainService = new BlockchainService();

  // Generate sample addresses (uncompressed secp256k1)
  const addrFoundation = blockchainService.generateAddress();
  const rewardAddress = blockchainService.generateAddress();

  const organizations = [
    blockchainService.generateAddress(),
    blockchainService.generateAddress(),
    blockchainService.generateAddress(),
    blockchainService.generateAddress(),
  ];

  console.log("✅ Verifying initial organizations...");
  organizations.forEach((org) => {
    blockchainService.verifyOrganization(org);
    console.log(`   ✓ Verified: ${org}`);
  });

  console.log("⛏️  Mining genesis block...");
  const credentialSeed = blockchainService.storeCredential(
    addrFoundation,
    "hash_initial_credential",
    { purpose: "genesis" }
  );
  blockchainService.shareCredential(
    credentialSeed,
    addrFoundation,
    addrFoundation,
    48
  );
  const genesisBlock = await blockchainService.minePendingTransactions(rewardAddress);

  console.log("✅ Genesis block created successfully!");
  console.log(`   Block Hash: ${genesisBlock.hash}`);
  console.log(`   Transactions: ${genesisBlock.transactions.length}`);
  console.log(
    `   Timestamp: ${new Date(genesisBlock.timestamp).toISOString()}`
  );

  console.log("\n📊 Blockchain Status:");
  console.log(`   Chain Length: ${blockchainService.getChain().length}`);
  console.log(`   Latest Block: ${blockchainService.getLatestBlock().hash}`);
  console.log(`   Is Valid: ${blockchainService.isChainValid()}`);
  console.log(`   Verified Organizations: ${organizations.length}`);

  console.log("\n🎉 VeriShare BlockDAG Genesis initialization complete!");
}

initGenesis().catch(console.error);
