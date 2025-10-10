const { expect } = require("chai");
const { ethers } = require("hardhat");

async function domainFor(registry) {
  const net = await ethers.provider.getNetwork();
  return {
    name: "CredentialRegistry",
    version: "1",
    chainId: Number(net.chainId),
    verifyingContract: await registry.getAddress(),
  };
}

describe("CredentialRegistry EIP-712 and Shares", function () {
  let deployer, issuer, subject, org;
  let verifier, registry;

  beforeEach(async () => {
    [deployer, issuer, subject, org] = await ethers.getSigners();

    const VerifierF = await ethers.getContractFactory("VerifiedIssuerNFT");
    verifier = await VerifierF.connect(deployer).deploy(await deployer.getAddress());
    await verifier.waitForDeployment();

    // verify org address
    await expect(verifier.verifyOrg(await org.getAddress(), "Org", "ipfs://org"))
      .to.emit(verifier, "OrganizationVerified");

    const RegF = await ethers.getContractFactory("CredentialRegistry");
    registry = await RegF.connect(deployer).deploy(await deployer.getAddress(), await verifier.getAddress());
    await registry.waitForDeployment();
  });

  it("issues by sig and direct, grants shares, and indexes access correctly", async () => {
    // 1) Issue by EIP-712 signature (issuer signs)
    const hashHex = ethers.zeroPadValue(ethers.id("cred1"), 32);
    const uri = "ipfs://cid1";
    const deadline = Math.floor(Date.now() / 1000) + 3600;
    const nonce = await registry.nonces(await issuer.getAddress());

    const types = {
      Issue: [
        { name: "issuer", type: "address" },
        { name: "subject", type: "address" },
        { name: "hash", type: "bytes32" },
        { name: "uri", type: "string" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };

    const value = {
      issuer: await issuer.getAddress(),
      subject: await subject.getAddress(),
      hash: hashHex,
      uri,
      nonce: Number(nonce),
      deadline,
    };

    const sig = await issuer.signTypedData(await domainFor(registry), types, value);
    const { v, r, s } = ethers.Signature.from(sig);

    const tx1 = await registry.issueCredentialBySig(
      await issuer.getAddress(),
      await subject.getAddress(),
      hashHex,
      uri,
      deadline,
      v, r, s
    );
    const rc1 = await tx1.wait();
    const ev1 = rc1.logs.map(l => registry.interface.parseLog(l)).find(e => e.name === "CredentialIssued");
    const credId = ev1.args.id;

    // 2) Direct share grant by subject
    const exp1 = BigInt(Math.floor(Date.now() / 1000) + 7200);
    await expect(registry.connect(subject).grantShare(credId, await org.getAddress(), exp1))
      .to.emit(registry, "ShareGranted");

    // canOrgAccess true via index
    expect(await registry.canOrgAccess(await org.getAddress(), credId)).to.equal(true);

    // 3) Grant second share via EIP-712 (subject signs)
    const grantTypes = {
      Grant: [
        { name: "subject", type: "address" },
        { name: "credentialId", type: "uint256" },
        { name: "org", type: "address" },
        { name: "expiresAt", type: "uint64" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };
    const nonce2 = await registry.nonces(await subject.getAddress());
    const exp2 = BigInt(Math.floor(Date.now() / 1000) + 10800);
    const deadline2 = Math.floor(Date.now() / 1000) + 3600;
    const grantVal = {
      subject: await subject.getAddress(),
      credentialId: Number(credId),
      org: await org.getAddress(),
      expiresAt: Number(exp2),
      nonce: Number(nonce2),
      deadline: deadline2,
    };
    const sig2 = await subject.signTypedData(await domainFor(registry), grantTypes, grantVal);
    const { v: v2, r: r2, s: s2 } = ethers.Signature.from(sig2);
    const tx2 = await registry.grantShareBySig(
      await subject.getAddress(),
      credId,
      await org.getAddress(),
      exp2,
      deadline2,
      v2, r2, s2
    );
    await tx2.wait();

    // Still accessible
    expect(await registry.canOrgAccess(await org.getAddress(), credId)).to.equal(true);

    // Revoke latest share then ensure still true via fallback to prior share
    const latestShareId = await registry.lastShareIdFor(credId, await org.getAddress());
    await expect(registry.connect(subject).revokeShare(latestShareId)).to.emit(registry, "ShareRevoked");
    expect(await registry.canOrgAccess(await org.getAddress(), credId)).to.equal(true);

    // Revoke the remaining share -> false
    // find another shareId by scanning backwards
    const last = Number(await registry.nextShareId()) - 1;
    let prevId = 0;
    for (let i = last; i >= 1; i--) {
      const s = await registry.getShare(i).catch(() => null);
      if (!s) continue;
      if (Number(s.credentialId) === Number(credId) && s.org === await org.getAddress() && !s.revoked) {
        prevId = i;
        break;
      }
    }
    if (prevId) {
      await expect(registry.connect(subject).revokeShare(prevId)).to.emit(registry, "ShareRevoked");
    }
    expect(await registry.canOrgAccess(await org.getAddress(), credId)).to.equal(false);
  });

  it("rejects replay of EIP-712 issue signatures", async () => {
    const hashHex = ethers.zeroPadValue(ethers.id("cred2"), 32);
    const uri = "ipfs://cid2";
    const deadline = Math.floor(Date.now() / 1000) + 3600;
    const nonce = await registry.nonces(await issuer.getAddress());
    const types = {
      Issue: [
        { name: "issuer", type: "address" },
        { name: "subject", type: "address" },
        { name: "hash", type: "bytes32" },
        { name: "uri", type: "string" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };
    const value = {
      issuer: await issuer.getAddress(),
      subject: await subject.getAddress(),
      hash: hashHex,
      uri,
      nonce: Number(nonce),
      deadline,
    };
    const sig = await issuer.signTypedData(await domainFor(registry), types, value);
    const { v, r, s } = ethers.Signature.from(sig);
    await registry.issueCredentialBySig(await issuer.getAddress(), await subject.getAddress(), hashHex, uri, deadline, v, r, s);
    await expect(
      registry.issueCredentialBySig(await issuer.getAddress(), await subject.getAddress(), hashHex, uri, deadline, v, r, s)
    ).to.be.reverted;
  });
});
