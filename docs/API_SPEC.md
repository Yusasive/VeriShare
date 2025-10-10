# VeriShare Backend API

Base URL: http://localhost:5000

Auth
- POST /api/auth/register: Register a wallet (address, publicKey, encryptedPrivateKey, authSecretHash, recoveryEmail?, recoveryPhone?, metadata?)
- POST /api/auth/challenge: Create a short-lived login challenge for {address}. Returns nonce.
- POST /api/auth/verify: Verify signature of SHA-256(nonce) with wallet publicKey; issues JWT.
- GET /api/auth/me: Return wallet profile (Authorization: Bearer <token>).

Blockchain
- GET /api/blockchain/info: Node info and chain status.
- GET /api/blockchain/chain: Full chain dump.
- GET /api/blockchain/transactions/pending: Pending transactions.
- POST /api/blockchain/transaction: Create a signed transaction (secp256k1 DER signature). fromAddress/toAddress are public key hex when signing.
- POST /api/blockchain/mine: Mine pending transactions with rewardAddress (public key hex).
- POST /api/blockchain/credential/store: Anchor credential metadata/hash. Requires signature, timestamp, nonce; Optional ipfsContentBase64 uploads encrypted blob to IPFS and stores { ipfs: { cid } } in metadata.
- GET /api/blockchain/credential/verify/:credentialId/:ownerAddress: Verify credential.
- POST /api/blockchain/credential/share: Share credential time-bound. Requires signature, timestamp, nonce and verified organization (toAddress). Share becomes effective when mined; response includes txHash.
- GET /api/blockchain/credential/share/:shareId: Share details.
- GET /api/blockchain/credential/share/:shareId/:requestingAddress: Verify share access.
- GET /api/blockchain/credential/shares/:address: Shares involving address.
- POST /api/blockchain/credential/revoke: Revoke credential. Requires signature, timestamp, nonce.
- GET /api/blockchain/credentials: Query credential records.
- GET /api/blockchain/credentials/:ownerAddress: Records + on-chain for owner.
- POST /api/blockchain/organization/verify: Mark org verified (admin op, Authorization: Bearer <JWT> with admin address).
- GET /api/blockchain/organizations: List orgs.
- GET /api/blockchain/organization/verify/:orgAddress: Verify status.
- GET /api/blockchain/audit/:address: Audit timeline.
- POST /api/blockchain/nodes/register (admin), GET /api/blockchain/nodes, GET /api/blockchain/consensus

Consent
- POST /api/consent/request: Create consent request {credentialId, ownerAddress, organizationAddress, requestedData[], expiresInHours}.
- POST /api/consent/decision: Owner approves/denies {requestId, ownerAddress, decision, reason?}. On approve, a share is created.
- GET /api/consent/id/:requestId: Fetch by id.
- GET /api/consent/owner/:ownerAddress: List for owner.
- GET /api/consent/org/:organizationAddress: List for organization.
- POST /api/consent/token (auth org): Issue short-lived QR/access token for a consent request. Body { requestId, expiresInMinutes } -> { token, expiresAt }.
- GET /api/consent/token/:token: Minimal info for display when scanned.
- POST /api/consent/token/:token/redeem: Redeem token to pull full request context for the owner.

Compliance
- GET /api/compliance/report?ownerAddress=ADDR&periodStart=ISO&periodEnd=ISO: Generates and persists a metrics report. Requires Authorization: Bearer <JWT> for the same ownerAddress.

Address format
- All addresses (ownerAddress, fromAddress, toAddress, orgAddress) must be uncompressed secp256k1 public key hex (130 chars, starts with 04). Use the same value for wallet `address` and `publicKey`. Wallet registration enforces this format.

Headers
- Content-Type: application/json
- Authorization: Bearer <JWT> where required

Organization
- POST /api/organization/apply (auth): Submit verification application { address, name, domain, documents[], metadata }
- POST /api/organization/review (admin): Approve/reject { address, status: approved|rejected, reviewNotes?, metadata? }
- GET  /api/organization/:address: Public profile + on-chain verified flag

Errors
- 400 Bad Request { error }
- 401 Unauthorized { error }
- 404 Not Found { error }
- 500 Internal Server Error { message }

Security
- JWT: HS256 using JWT_SECRET, TTL default 12h
- Admins: ADMIN_ADDRESSES CSV of uncompressed secp256k1 public keys; admin-only routes require token from one of these addresses.
- CORS: CORS_ORIGIN env supports wildcard or CSV list

Environment
- MONGO_URI or DATABASE_URL
- JWT_SECRET, JWT_EXPIRES_IN
- ADMIN_ADDRESSES (CSV of admin addresses)
- IPFS_API_URL, IPFS_API_KEY (optional for /credential/store with IPFS)
- CORS_ORIGIN

See backend/docs/postman/verishare-backend.postman_collection.json for full examples.

## EVM (Ethereum) Endpoints
- GET  /api/evm/org/verified/:address → check verification
- POST /api/evm/org/verify (admin) → mint VerifiedIssuerNFT to org address
- POST /api/evm/credential/issue → direct issue (subject, hashHex, uri[, contentHashBytes])
- POST /api/evm/credential/issueBySig → relayed issue (issuer, subject, hashHex, uri, deadline, v, r, s)
- POST /api/evm/credential/revoke → revoke credential by id
- POST /api/evm/share/grant → direct grant (credentialId, org, expiresAt)
- POST /api/evm/share/grantBySig → relayed grant (subject, credentialId, org, expiresAt, deadline, v, r, s)
- POST /api/evm/share/revoke → revoke shareId
- POST /api/evm/consent/log → direct consent (org, credentialId, scopeHashHex, approved)
- POST /api/evm/consent/logBySig → relayed consent (subject, org, credentialId, scopeHashHex, approved, deadline, v, r, s)
