const { ethers } = require("ethers");
const { ethers } = require("ethers");
const path = require("path");
const fs = require("fs");

function loadAbi(name) {
  const p = path.resolve(__dirname, "../abi/" + name + ".json");
  return JSON.parse(fs.readFileSync(p, "utf8")).abi;
}

class EvmService {
  constructor(opts = {}) {
    this.rpcUrl = opts.rpcUrl || process.env.EVM_RPC_URL || process.env.EVM_PRIMORDIAL_RPC_URL || process.env.PRIMORDIAL_RPC_URL || process.env.EVM_FANTOM_RPC_URL || process.env.EVM_SEPOLIA_RPC_URL || process.env.FTM_TESTNET_RPC_URL || process.env.FANTOM_TESTNET_RPC_URL || process.env.SEPOLIA_RPC_URL || "";
    this.privateKey = opts.privateKey || process.env.EVM_PRIVATE_KEY || process.env.PRIVATE_KEY || "";
    if (!this.rpcUrl) throw new Error("EVM RPC URL missing");
    if (!this.privateKey) throw new Error("EVM PRIVATE KEY missing");

    this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
    this.wallet = new ethers.Wallet(this.privateKey, this.provider);

    this.addresses = {
      registry: opts.registry || process.env.EVM_REGISTRY_ADDRESS || "",
      verifier: opts.verifier || process.env.EVM_VERIFIER_ADDRESS || "",
      consent: opts.consent || process.env.EVM_CONSENT_ADDRESS || "",
      walletRegistry: opts.walletRegistry || process.env.EVM_WALLETREG_ADDRESS || "",
    };

    const regAbi = loadAbi("CredentialRegistry");
    const verAbi = loadAbi("VerifiedIssuerNFT");
    const conAbi = loadAbi("ConsentAudit");
    const walAbi = loadAbi("WalletRegistry");

    if (this.addresses.registry) this.registry = new ethers.Contract(this.addresses.registry, regAbi, this.wallet);
    if (this.addresses.verifier) this.verifier = new ethers.Contract(this.addresses.verifier, verAbi, this.wallet);
    if (this.addresses.consent) this.consent = new ethers.Contract(this.addresses.consent, conAbi, this.wallet);
    if (this.addresses.walletRegistry) this.walletRegistry = new ethers.Contract(this.addresses.walletRegistry, walAbi, this.wallet);
  }

  async issueCredential(subject, hashHex, uri, contentHashBytes) {
    if (!this.registry) throw new Error("Registry not configured");
    let tx;
    if (contentHashBytes && contentHashBytes.length > 0) {
      tx = await this.registry.issueCredentialV2(subject, hashHex, uri, contentHashBytes);
    } else {
      tx = await this.registry.issueCredential(subject, hashHex, uri);
    }
    const rc = await tx.wait();
    const ev = rc.logs.map(l => this.registry.interface.parseLog(l)).find(e => e.name === "CredentialIssued");
    return { txHash: rc.hash, id: ev?.args?.id?.toString() };
  }

  async revokeCredential(id) {
    if (!this.registry) throw new Error("Registry not configured");
    const tx = await this.registry.revokeCredential(id);
    const rc = await tx.wait();
    return { txHash: rc.hash };
  }

  async grantShare(credentialId, org, expiresAt) {
    if (!this.registry) throw new Error("Registry not configured");
    const tx = await this.registry.grantShare(credentialId, org, expiresAt);
    const rc = await tx.wait();
    const ev = rc.logs.map(l => this.registry.interface.parseLog(l)).find(e => e.name === "ShareGranted");
    return { txHash: rc.hash, shareId: ev?.args?.shareId?.toString() };
  }

  async revokeShare(shareId) {
    if (!this.registry) throw new Error("Registry not configured");
    const tx = await this.registry.revokeShare(shareId);
    const rc = await tx.wait();
    return { txHash: rc.hash };
  }

  async isOrgVerified(address) {
    if (!this.verifier) throw new Error("Verifier not configured");
    return await this.verifier.isVerified(address);
  }

  async verifyOrg(org, name, uri) {
    if (!this.verifier) throw new Error("Verifier not configured");
    const tx = await this.verifier.verifyOrg(org, name, uri);
    const rc = await tx.wait();
    return { txHash: rc.hash };
  }

  async revokeOrg(org) {
    if (!this.verifier) throw new Error("Verifier not configured");
    const tx = await this.verifier.revokeOrg(org);
    const rc = await tx.wait();
    return { txHash: rc.hash };
  }

  async logConsent(org, credentialId, scopeHashHex, approved) {
    if (!this.consent) throw new Error("Consent not configured");
    const tx = await this.consent.logConsent(org, credentialId, scopeHashHex, approved);
    const rc = await tx.wait();
    return { txHash: rc.hash };
  }
  async issueCredentialBySig(issuer, subject, hashHex, uri, deadline, v, r, s) {
    if (!this.registry) throw new Error("Registry not configured");
    const tx = await this.registry.issueCredentialBySig(issuer, subject, hashHex, uri, deadline, v, r, s);
    const rc = await tx.wait();
    const ev = rc.logs.map(l => this.registry.interface.parseLog(l)).find(e => e.name === "CredentialIssued");
    return { txHash: rc.hash, id: ev?.args?.id?.toString() };
  }

  async grantShareBySig(subject, credentialId, org, expiresAt, deadline, v, r, s) {
    if (!this.registry) throw new Error("Registry not configured");
    const tx = await this.registry.grantShareBySig(subject, credentialId, org, expiresAt || 0, deadline, v, r, s);
    const rc = await tx.wait();
    const ev = rc.logs.map(l => this.registry.interface.parseLog(l)).find(e => e.name === "ShareGranted");
    return { txHash: rc.hash, shareId: ev?.args?.shareId?.toString() };
  }

  async logConsentBySig(subject, org, credentialId, scopeHashHex, approved, deadline, v, r, s) {
    if (!this.consent) throw new Error("Consent not configured");
    const tx = await this.consent.logConsentBySig(subject, org, credentialId, scopeHashHex, !!approved, deadline, v, r, s);
    const rc = await tx.wait();
    return { txHash: rc.hash };
  }
}

module.exports = EvmService;
