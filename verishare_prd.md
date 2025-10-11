# VeriShare - Secure Personal Data Exchange Platform (EVM)

## 1. Overview
**VeriShare** is a decentralized platform that enables secure, verifiable, and user-controlled data sharing on EVM-compatible blockchains (Ethereum mainnet/testnets or EVM L2s). Individuals store credential proofs on-chain and share them with verified organizations via QR codes or access tokens. VeriShare aligns with NIST and ISO cybersecurity standards to ensure confidentiality, integrity, and consent-driven access.

---

## 2. Goals & Objectives
### Primary Goal
Create a secure, NIST/ISO-compliant data transfer platform where users own, manage, and share digital credentials without compromising privacy or authenticity.

### Objectives
- Enable self-sovereign identity (SSI) using EVM smart contracts.
- Provide fine-grained, consent-based data sharing (QR/token).
- Onboard/verify institutions on-chain for trusted requests.
- Maintain full audit trails via EVM events and off-chain logs.
- Ensure encryption at rest, in transit, and on-chain metadata integrity.

---

## 3. Target Audience
1. Students – Store/share academic and identity credentials.
2. Institutions – Request verified data securely.
3. Developers – Integrate VeriShare verification into portals.
4. Government/Employers – Validate credentials with trust.

---

## 4. Product Features

### 4.1 Home Page
- Overview, quick actions (Create Wallet, Login, Learn More), basic statistics.

### 4.2 Verification Screen
- QR scanner + token input.
- Shows requesting organization + on-chain verification status.
- Displays requested data scope; user approves/denies.
- On approval, encrypted data is shared; on-chain consent event is logged.

### 4.3 Wallet Screen (Manage Credentials)
- Initially focused on students (name, email, NIN/BVN, DOB, institution, level, department, etc.).
- Add/edit/revoke credentials.
- Client-side encryption; on-chain stores credential hashes/metadata.

### 4.4 History Screen (Audit Trail)
- Chronological list of share/consent events.
- Timestamps, org name, data scope hash, transaction hash.
- Data sourced from EVM events (e.g., ConsentAudit) and backend logs.

### 4.5 Settings Screen
- Biometric/MFA, PIN, session timeout, connected wallets/devices.

### 4.6 Developer Portal (Verified Institutions)
- Register, request API access, generate QR codes/tokens.
- View verification status and manage public keys/certificates.

---

## 5. User Flow

1. Registration
   - User generates EC keypair; public key associated with wallet.
   - Private key remains local; public key/address is referenced by backend and optionally bound on-chain.

2. Upload Credentials
   - Data encrypted client-side (AES-256).
   - Content hash + metadata stored via smart contracts (e.g., CredentialRegistry).
   - Encrypted blobs stored on IPFS; URIs may be anchored in events/metadata.

3. Data Request (Verification)
   - Organization integrates VeriShare SDK and issues a QR/token.
   - App fetches org details + requested data scope.
   - User reviews and approves/denies.
   - On approval, backend grants share via smart contract (grantShare) and logs consent (ConsentAudit).

4. History / Audit Trail
   - User can review approvals/denials and chain tx hashes.
   - Organizations can show verifiable proof of user consent.

---

## 6. Architecture Overview

### 6.1 Components
| Component | Description |
| --- | --- |
| Frontend | Next.js (web portal) and Flutter (mobile) UIs. |
| Backend | Node.js + Express REST API; integrates with EVM (ethers.js). |
| Smart Contracts | Solidity contracts on EVM (CredentialRegistry, VerifiedIssuerNFT, ConsentAudit, WalletRegistry). |
| Storage | IPFS for encrypted blobs; chain stores hashes/metadata. |
| Crypto Layer | Ethers.js / WebCrypto for key management and encryption. |
| Verification Service | On-chain org verification via VerifiedIssuerNFT. |

### 6.2 Security Model
- At Rest: AES-256 encryption using keys derived client-side.
- In Transit: E2EE for transfers where applicable.
- On Chain: Only hashes/metadata; consent and share events logged.
- Access Control: Shares granted to whitelisted org addresses on-chain.
- Compliance: Aligns with NIST SP 800-63 and ISO/IEC 27001.

---

## 7. Organization Verification System

1. Organization Registration
   - Institution submits details (domain, docs) via portal.
2. Verification Methods
   - DNS TXT, domain email, document verification.
3. On-Chain Certificate
   - VerifiedIssuerNFT minted to approved org address.
4. In-App Validation
   - App checks VerifiedIssuerNFT ownership for requestor address.
   - Displays: Verified Organization or Unverified Source.

---

## 8. Compliance & Security Standards
| Standard | Description |
| --- | --- |
| NIST SP 800-63 | Digital Identity Guidelines. |
| ISO/IEC 27001 | ISMS controls and governance. |
| ISO/IEC 27701 | Privacy information management. |
| GDPR Principles | Data minimization, consent, portability. |

---

## 9. Tech Stack Summary
| Layer | Tools/Tech |
| --- | --- |
| Frontend | Flutter / Next.js |
| Backend | Node.js + Express |
| Smart Contracts | Solidity on EVM, ethers.js integration |
| Storage | IPFS (encrypted blobs) |
| Cryptography | AES-256, SHA-256/3, ECC (secp256k1) |
| SDK/Docs | REST API + OpenAPI docs |

---

## 10. Future Roadmap
- Extend domains beyond education (gov, healthcare, employment).
- Introduce reusable VeriShare ID NFT.
- National ID framework integrations.
- Fraud detection for fake credentials.
- Open developer SDKs with sandbox.

---

## 11. KPIs
- Wallets created; verification success rate; tx throughput and latency; on-chain validation consistency; verified orgs onboarded.

---

## 12. Pitch Summary
Problem: Manual verification is repetitive, insecure, and error-prone.

Solution: VeriShare — encrypted, consent-based sharing with on-chain auditability on EVM.

Why It Stands Out:
- User-owned data; encryption at all stages.
- Real-time verification via QR/token.
- Verifiable trust through on-chain org certificates.

Impact: Streamlines verification for millions with strong security guarantees.

---

Document Version: 2.0 (EVM)
Date: October 2025
Author: Yusasive
