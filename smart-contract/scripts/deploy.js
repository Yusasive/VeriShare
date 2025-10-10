const hre = require("hardhat");

async function verify(address, args = []) {
  const network = hre.network.name;
  if (network.includes("hardhat") || network.includes("localhost")) return;
  try {
    await hre.run("verify:verify", { address, constructorArguments: args });
    console.log(`✓ Verified ${address}`);
  } catch (e) {
    console.warn(`Verify skipped/failed for ${address}:`, e.message || e);
  }
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;
  console.log(`Deployer: ${await deployer.getAddress()} on ${network}`);

  // 1) VerifiedIssuerNFT
  const VerifierF = await hre.ethers.getContractFactory("VerifiedIssuerNFT");
  const verifier = await VerifierF.deploy(await deployer.getAddress());
  await verifier.waitForDeployment();
  const verifierAddr = await verifier.getAddress();
  console.log("VerifiedIssuerNFT:", verifierAddr);

  // 2) WalletRegistry
  const WalletF = await hre.ethers.getContractFactory("WalletRegistry");
  const walletReg = await WalletF.deploy();
  await walletReg.waitForDeployment();
  const walletRegAddr = await walletReg.getAddress();
  console.log("WalletRegistry:", walletRegAddr);

  // 3) CredentialRegistry (owner = deployer, verifier)
  const RegistryF = await hre.ethers.getContractFactory("CredentialRegistry");
  const registry = await RegistryF.deploy(await deployer.getAddress(), verifierAddr);
  await registry.waitForDeployment();
  const registryAddr = await registry.getAddress();
  console.log("CredentialRegistry:", registryAddr);

  // 4) ConsentAudit
  const ConsentF = await hre.ethers.getContractFactory("ConsentAudit");
  const consent = await ConsentF.deploy(verifierAddr);
  await consent.waitForDeployment();
  const consentAddr = await consent.getAddress();
  console.log("ConsentAudit:", consentAddr);

  // Optional verification
  await verify(verifierAddr, [await deployer.getAddress()]);
  await verify(walletRegAddr);
  await verify(registryAddr, [await deployer.getAddress(), verifierAddr]);
  await verify(consentAddr, [verifierAddr]);

  console.log("Deployed addresses:", { verifier: verifierAddr, walletRegistry: walletRegAddr, registry: registryAddr, consent: consentAddr });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
