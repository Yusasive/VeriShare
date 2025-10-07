# VeriShare Project Setup

## Overview
This repository provides the foundational setup for the **VeriShare** project — a secure data-sharing platform built using **Flutter**, **Next.js**, and **BlockDAG**.

The goal is to create a system that enables citizens to own, protect, and share their verified credentials securely while maintaining compliance with **ISO/NIST** cybersecurity standards.

---

## Tech Stack
| Layer | Technology | Purpose |
|-------|-------------|----------|
| Frontend | Next.js + TypeScript + TailwindCSS | Landing page, verification portal, and developer documentation |
| Mobile | Flutter + Dart | User app for credential management and verification |
| Backend | Daml or Solidity | Smart contracts for credential management on BlockDAG |
| Storage | IPFS + MongoDB | Decentralized and secure data storage |
| Blockchain | BlockDAG | Immutable ledger for verification and audit trails |

---

## Folder Structure

```
verishare/
│
├── apps/
│   ├── flutter_app/           # Flutter mobile app (citizen wallet)
│   ├── nextjs_portal/         # Next.js web portal (verification, landing page)
│
├── backend/
│   ├── smart_contracts/       # Daml or Solidity contracts
│   ├── api_gateway/           # Node.js API (bridge between frontend and blockchain)
│
├── infrastructure/
│   ├── docker/                # Docker configuration files
│   ├── ci_cd/                 # GitHub Actions / GitLab CI pipelines
│
├── docs/
│   ├── api_specifications.md  # API endpoints and schema details
│   ├── architecture_diagram.png
│
└── README.md
```

---

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/Yusasive/VeriShare.git
cd verishare
```

### 2. Install Dependencies

#### Flutter App
```bash
cd apps/flutter_app
flutter pub get
```

#### Next.js Portal
```bash
cd apps/nextjs_portal
npm install
```

#### Backend Services
```bash
cd backend/api_gateway
npm install
```

---

##  Next Steps (Phase 1)
1. Implement authentication & wallet creation in Flutter app.
2. Set up institutional onboarding in Next.js portal.
3. Integrate BlockDAG smart contracts for credential issuance.
4. Connect IPFS for decentralized document storage.
5. Begin API testing and CI/CD automation.

---

##  Contributors
**Project Lead:** Yusasive  

---

##  License
This project is licensed under the MIT License.
