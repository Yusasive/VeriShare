# VeriShare EVM Contracts (Hardhat)

Contracts: CredentialRegistry.sol

Env vars (set before running):
- SEPOLIA_RPC_URL / AMOY_RPC_URL / POLYGON_RPC_URL / MAINNET_RPC_URL
- PRIVATE_KEY (deployer, without 0x prefix optional)
- ETHERSCAN_API_KEY (for Ethereum) and/or POLYGONSCAN_API_KEY (for Polygon)

Common commands:
- npm install
- npx hardhat compile
- NETWORK=sepolia npx hardhat run scripts/deploy.js --network sepolia
- NETWORK=ftmTestnet npx hardhat run scripts/deploy.js --network ftmTestnet
- NETWORK=primordial npx hardhat run scripts/deploy.js --network primordial
- npx hardhat verify --network sepolia <DEPLOYED_ADDRESS>
- npx hardhat verify --network ftmTestnet <DEPLOYED_ADDRESS>

Events (visible on explorer):
- CredentialIssued(id, issuer, subject, hash, uri)
- CredentialRevoked(id, issuer)
- ShareGranted(shareId, credentialId, owner, org, expiresAt)
- ShareRevoked(shareId, owner)
- ConsentLogged(subject, org, credentialId, scopeHash, approved)

Integrations:
- Backend can read CONTRACT_ADDRESS and CHAIN_ID to call issue/revoke/verify.

## EIP-712 Signatures

Domain separators:
- CredentialRegistry: name = "CredentialRegistry", version = "1"
- ConsentAudit: name = "ConsentAudit", version = "1"

Typed data:
- ISSUE_TYPEHASH = keccak256("Issue(address issuer,address subject,bytes32 hash,string uri,uint256 nonce,uint256 deadline)")
- GRANT_TYPEHASH = keccak256("Grant(address subject,uint256 credentialId,address org,uint64 expiresAt,uint256 nonce,uint256 deadline)")
- CONSENT_TYPEHASH = keccak256("Consent(address subject,address org,uint256 credentialId,bytes32 scopeHash,bool approved,uint256 nonce,uint256 deadline)")

Available methods:
- issueCredential(subject, hash, uri) -> id
- issueCredentialV2(subject, hash, uri, contentHash) -> id
- issueCredentialBySig(issuer, subject, hash, uri, deadline, v, r, s) -> id
- revokeCredential(id)
- grantShare(credentialId, org, expiresAt) -> shareId
- grantShareBySig(subject, credentialId, org, expiresAt, deadline, v, r, s) -> shareId
- revokeShare(shareId)
- ConsentAudit.logConsent(org, credentialId, scopeHash, approved)
- ConsentAudit.logConsentBySig(subject, org, credentialId, scopeHash, approved, deadline, v, r, s)

Notes:
- Nonces are tracked per signer address in each contract.
- deadline is a unix seconds timestamp; signatures are rejected after expiry.
- Relayers can submit signed payloads; contracts validate signatures on-chain.
