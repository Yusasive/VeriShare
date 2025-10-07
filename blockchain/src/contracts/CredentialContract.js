const crypto = require("crypto-js");

class CredentialContract {
  constructor() {
    this.credentials = new Map(); // address -> credential data hash
    this.verifiedOrganizations = new Set();
    this.auditLog = [];
  }

  // Store encrypted credential hash on blockchain
  storeCredential(ownerAddress, credentialHash, metadata = {}) {
    const credentialId = crypto
      .SHA256(ownerAddress + credentialHash + Date.now())
      .toString();

    const credential = {
      id: credentialId,
      owner: ownerAddress,
      hash: credentialHash,
      metadata: metadata,
      timestamp: Date.now(),
      status: "active",
    };

    this.credentials.set(credentialId, credential);

    // Log audit event
    this.auditLog.push({
      type: "credential_stored",
      credentialId: credentialId,
      owner: ownerAddress,
      timestamp: Date.now(),
    });

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

    // Log audit event
    this.auditLog.push({
      type: "credential_shared",
      shareId: shareId,
      credentialId: credentialId,
      fromAddress: fromAddress,
      toAddress: toAddress,
      timestamp: Date.now(),
    });

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
    for (const [id, credential] of this.credentials) {
      if (credential.owner === ownerAddress) {
        credentials.push(credential);
      }
    }
    return credentials;
  }

  // Verify share access
  verifyShareAccess(shareId, requestingAddress) {
    // In a real implementation, shares would be stored on-chain
    // For now, return a mock response
    return {
      valid: true,
      shareId: shareId,
      requestingAddress: requestingAddress,
    };
  }
}

module.exports = CredentialContract;
