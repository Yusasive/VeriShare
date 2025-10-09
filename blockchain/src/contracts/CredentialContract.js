const crypto = require("crypto-js");
const DB = require("../storage/db");

class CredentialContract {
  constructor() {
    this.credentials = new Map();
    this.verifiedOrganizations = new Set();
    this.auditLog = [];
    this.shares = new Map();

    // Initialize lightweight persistence
    const dbPath = process.env.CONTRACT_DB_PATH || "./data/contract.db";
    this.db = new DB(dbPath);
    this._loaded = false;
    this._init();
  }

  async _init() {
    try {
      const creds = await this.db.getJSON("contract:credentials", []);
      const orgs = await this.db.getJSON("contract:orgs", []);
      const shares = await this.db.getJSON("contract:shares", []);
      const audit = await this.db.getJSON("contract:audit", []);
      this.credentials = new Map((creds || []).map((c) => [c.id, c]));
      this.verifiedOrganizations = new Set(orgs || []);
      this.shares = new Map((shares || []).map((s) => [s.id, s]));
      this.auditLog = audit || [];
    } catch (e) {
      // ignore
    }
    this._loaded = true;
  }

  _persist() {
    const creds = Array.from(this.credentials.values());
    const orgs = Array.from(this.verifiedOrganizations.values());
    const shares = Array.from(this.shares.values());
    const audit = this.auditLog;
    this.db.putJSON("contract:credentials", creds).catch(() => {});
    this.db.putJSON("contract:orgs", orgs).catch(() => {});
    this.db.putJSON("contract:shares", shares).catch(() => {});
    this.db.putJSON("contract:audit", audit).catch(() => {});
  }

  // Store encrypted credential hash on blockchain (idempotent)
  storeCredential(ownerAddress, credentialHash, metadata = {}) {
    const credentialId = crypto
      .SHA256(ownerAddress + credentialHash)
      .toString();

    if (!this.credentials.has(credentialId)) {
      const credential = {
        id: credentialId,
        owner: ownerAddress,
        hash: credentialHash,
        metadata: metadata,
        timestamp: Date.now(),
        status: "active",
      };
      this.credentials.set(credentialId, credential);
    } else {
      // merge metadata
      const existing = this.credentials.get(credentialId);
      existing.metadata = { ...(existing.metadata || {}), ...(metadata || {}) };
    }

    this.auditLog.push({
      type: "credential_stored",
      credentialId: credentialId,
      owner: ownerAddress,
      timestamp: Date.now(),
    });

    this._persist();
    return credentialId;
  }

  // Verify credential ownership
  verifyCredential(credentialId, ownerAddress) {
    const credential = this.credentials.get(credentialId);
    if (!credential) {
      return { valid: false, reason: "Credential not found" };
    }

    if (credential.owner !== ownerAddress) {
      return { valid: false, reason: "Invalid owner" };
    }

    if (credential.status !== "active") {
      return { valid: false, reason: "Credential not active" };
    }

    return { valid: true, credential: credential };
  }

  // Share credential with another address (temporary access)
  shareCredential(credentialId, fromAddress, toAddress, expiryHours = 24) {
    const credential = this.credentials.get(credentialId);
    if (!credential || credential.owner !== fromAddress) {
      throw new Error("Invalid credential or owner");
    }

    const shareId = crypto
      .SHA256(credentialId + toAddress + Date.now())
      .toString();
    const expiryTime = Date.now() + expiryHours * 60 * 60 * 1000;

    const share = {
      id: shareId,
      credentialId: credentialId,
      fromAddress: fromAddress,
      toAddress: toAddress,
      expiryTime: expiryTime,
      status: "active",
      createdAt: Date.now(),
    };

    this.shares.set(shareId, share);

    this.auditLog.push({
      type: "credential_shared",
      shareId: shareId,
      credentialId: credentialId,
      fromAddress: fromAddress,
      toAddress: toAddress,
      timestamp: Date.now(),
    });

    this._persist();
    return share;
  }

  // Verify organization (admin function)
  verifyOrganization(orgAddress) {
    this.verifiedOrganizations.add(orgAddress);

    this.auditLog.push({
      type: "organization_verified",
      orgAddress: orgAddress,
      timestamp: Date.now(),
    });

    this._persist();
    return true;
  }

  // Check if organization is verified
  isOrganizationVerified(orgAddress) {
    return this.verifiedOrganizations.has(orgAddress);
  }

  // Revoke credential
  revokeCredential(credentialId, ownerAddress) {
    const credential = this.credentials.get(credentialId);
    if (!credential || credential.owner !== ownerAddress) {
      throw new Error("Invalid credential or owner");
    }

    credential.status = "revoked";

    this.auditLog.push({
      type: "credential_revoked",
      credentialId: credentialId,
      owner: ownerAddress,
      timestamp: Date.now(),
    });

    this._persist();
    return true;
  }

  // Get audit trail for an address
  getAuditTrail(address) {
    return this.auditLog.filter(
      (entry) =>
        entry.owner === address ||
        entry.fromAddress === address ||
        entry.toAddress === address ||
        entry.orgAddress === address
    );
  }

  // Get all credentials for an address
  getCredentialsByOwner(ownerAddress) {
    const credentials = [];
    for (const credential of this.credentials.values()) {
      if (credential.owner === ownerAddress) {
        credentials.push(credential);
      }
    }
    return credentials;
  }

  getShare(shareId) {
    return this.shares.get(shareId) || null;
  }

  getSharesForAddress(address) {
    return Array.from(this.shares.values()).filter(
      (share) => share.fromAddress === address || share.toAddress === address
    );
  }

  pruneExpiredShares() {
    const now = Date.now();
    for (const share of this.shares.values()) {
      if (share.status === "active" && share.expiryTime <= now) {
        share.status = "expired";
        this.auditLog.push({
          type: "credential_share_expired",
          shareId: share.id,
          credentialId: share.credentialId,
          timestamp: now,
        });
      }
    }
    this._persist();
  }

  // Verify share access
  verifyShareAccess(shareId, requestingAddress) {
    this.pruneExpiredShares();
    const share = this.shares.get(shareId);
    if (!share) {
      return { valid: false, reason: "Share not found" };
    }

    if (share.status !== "active") {
      return { valid: false, reason: "Share is no longer active" };
    }

    if (share.toAddress !== requestingAddress) {
      return { valid: false, reason: "Unauthorized requester" };
    }

    return {
      valid: true,
      shareId: share.id,
      credentialId: share.credentialId,
      expiresAt: share.expiryTime,
    };
  }
}

module.exports = CredentialContract;
