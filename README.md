# VeriShare Platform (EVM-Only)

> Secure credential verification ecosystem using Solidity smart contracts on EVM networks, with a Node.js backend and cross-platform clients

VeriShare enables organizations to onboard, verify credentials, and manage trust using EVM smart contracts. The platform integrates web and mobile apps with a backend API for end-to-end credential lifecycle management.


## Presentation Slide
https://www.canva.com/design/DAGRMgs75y0/1Pr4rtCfP7B_REcOZWCVIQ/edit?utm_content=DAGRMgs75y0&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton

## Backend URL
https://verishare-backend.onrender.com/

## Mobile URL
https://drive.google.com/drive/folders/12iUATaLuoqrvynsxmyT2xLU1-caPc8RmqZfQ4uilai1a_Fv-hw4D2qRziAo2fUMbuqpA8el9?usp=drive_link

## Demo Video
https://drive.google.com/file/d/1UG9JcerYCnYEh3T-k7wbpspz53OYMn2X/view?usp=drivesdk

## Frontend URL
[https://team-hotel.app.netlify/](https://team-hotel.netlify.app/)


## Overview

- Organization Portal – Next.js web admin interface
- Mobile Credential Wallet – Flutter app for secure storage and verification
- API Gateway Backend – Node.js + Express REST API (OpenAPI/Swagger docs)
- Smart Contracts – Solidity contracts for credential issuance, sharing, and consent logs

## Architecture

```
verishare/
├── backend/            # Node.js REST API Gateway (Express + ethers.js)
├── frontend/           # Next.js Organization Portal
├── mobile/             # Flutter Credential Wallet
├── smart-contract/     # Solidity contracts (Hardhat)
├── docs/               # Project documentation (OpenAPI, architecture)
└── docker/             # Containerization (optional)
```

### Component Overview

| Component | Technology | Purpose |
| --- | --- | --- |
| Backend | Node.js + Express + ethers.js | REST APIs, auth, EVM integration |
| Frontend | Next.js + TypeScript | Organization onboarding and dashboard |
| Mobile | Flutter + Dart | Credential wallet and QR/token scanner |
| Smart Contracts | Solidity (Hardhat) | CredentialRegistry, VerifiedIssuerNFT, ConsentAudit |

## Quick Start

### Prerequisites
- Node.js 18+
- Flutter SDK 3.7+
- Git
- (Optional) Docker

### 1) Install Dependencies

Backend
```
cd backend
npm install
npm run dev
```

Frontend
```
cd frontend
npm install
npm run dev
```

Mobile
```
cd mobile
flutter pub get
flutter run
```

Smart Contracts
```
cd smart-contract
npm install
# compile/deploy per hardhat scripts
```

### 2) Environment Variables

Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/verishare
JWT_SECRET=replace-with-strong-secret
CORS_ORIGIN=http://localhost:3000
ADMIN_ADDRESSES=0xAdminAddress1,0xAdminAddress2

EVM_RPC_URL=https://sepolia.infura.io/v3/<key>
EVM_PRIVATE_KEY=0x...
EVM_REGISTRY_ADDRESS=0x...
EVM_VERIFIER_ADDRESS=0x...
EVM_CONSENT_ADDRESS=0x...
EVM_WALLETREG_ADDRESS=0x...

PINATA_JWT=eyJhbGciOi...
```

Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Mobile (.env)
```
API_BASE_URL=http://localhost:5000
```

### 3) Run Services
- Backend API: http://localhost:5000
- Swagger Docs: http://localhost:5000/docs
- Frontend App: http://localhost:3000
- Mobile: emulator/device

## Backend Details
- Routes: /api/auth, /api/organization, /api/consent, /api/compliance, /api/evm
- Uses ethers.js to interact with deployed contracts (addresses via env)
- IPFS uploads via Pinata (PINATA_JWT)
- Rate limiting, CORS, Helmet, JWT auth

## Contracts (smart-contract/)
- CredentialRegistry.sol – issue/revoke credentials; grant/revoke shares
- VerifiedIssuerNFT.sol – on-chain org verification
- ConsentAudit.sol – logs consent events (scope hash, approval)
- WalletRegistry.sol – optional binding of wallet pubkeys

## Documentation
- OpenAPI: docs/openapi.yaml (served via /docs)
- System Architecture: docs/SYSTEM_ARCHITECTURE.md
- API Spec: docs/API_SPEC.md
- Project Phases: docs/PROJECT_PHASES.md

## Testing
Backend
```
cd backend
npm test
```

Smart Contracts
```
cd smart-contract
npm run test
```

## Deployment
- Use environment variables to point to production RPC and contract addresses
- Docker Compose available at project root (docker-compose.yml).

## Troubleshooting
- Ensure MongoDB is running and MONGO_URI is correct
- Verify EVM_RPC_URL, EVM_PRIVATE_KEY, and contract addresses are set
- Check /docs for API schema and try health: GET /health

---

Version: 3.0.0 (EVM)
Status: Active Development
