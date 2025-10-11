# VeriShare EVM Contracts – Sepolia Deployment Guide

Contracts in this folder:
- VerifiedIssuerNFT.sol – mints NFT to verified organizations (admin-controlled)
- WalletRegistry.sol – binds 130-char uncompressed secp256k1 pubkey hex to an EVM address
- CredentialRegistry.sol – issues/revokes credential hashes, time-bound shares, verified-org enforcement, pausable/ownable, optional EIP-1577 contenthash
- ConsentAudit.sol – logs consent approvals/denials; callable only when org is verified

Deployment target: Sepolia (Ethereum testnet)

## 1) Prerequisites
- Node.js 18+ and npm
- A funded Sepolia account (get ETH from a faucet)
- RPC URL (Alchemy/Infura/etc.)
- Etherscan API key (for source verification)

## 2) Install and Configure
```bash
cd smart-contract
npm install
```
Create a .env file in evm/ with one of the following RPC sets:

Sepolia:
```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/xxxxxxxx
PRIVATE_KEY=0xabcdef... # deployer EOA private key
ETHERSCAN_API_KEY=your_etherscan_key
```

Fantom testnet (recommended EVM-compatible BlockDAG):
```
FTM_TESTNET_RPC_URL=https://rpc.ankr.com/fantom_testnet
PRIVATE_KEY=0xabcdef...
FTMSCAN_API_KEY=your_ftmscan_key
```

Primordial (BDAG EVM):
```
PRIMORDIAL_RPC_URL=<your primordial evm rpc>
PRIMORDIAL_CHAIN_ID=<chain id number>
PRIVATE_KEY=0xabcdef...
# If BDAGScan offers Etherscan-compatible API, configure in hardhat.config.js customChains
```

Fantom mainnet:
```
OPERA_RPC_URL=https://rpc.ftm.tools
PRIVATE_KEY=0xabcdef...
FTMSCAN_API_KEY=your_ftmscan_key
```

## 3) Compile
```bash
npx hardhat compile
```

## 4) Deploy (auto‑verify)
```bash
# Sepolia example
NETWORK=sepolia npx hardhat run scripts/deploy.js --network sepolia
# Fantom testnet (EVM‑compatible BlockDAG) example
NETWORK=ftmTestnet npx hardhat run scripts/deploy.js --network ftmTestnet
# Primordial (BDAG EVM) example
NETWORK=primordial npx hardhat run scripts/deploy.js --network primordial
```
This deploys, then verifies:
- VerifiedIssuerNFT (constructor: owner = deployer)
- WalletRegistry
- CredentialRegistry (constructor: owner = deployer, verifier = VerifiedIssuerNFT)
- ConsentAudit (constructor: verifier = VerifiedIssuerNFT)

$env:NETWORK="awakening"; npx hardhat run scripts/deploy.js --network awakening


Copy the printed addresses for all contracts.

## 5) Manual Verification (only if auto‑verify skipped)
```bash
# Sepolia
npx hardhat verify --network sepolia <VerifiedIssuerNFT_Address> <Deployer_EOA>
npx hardhat verify --network sepolia <WalletRegistry_Address>
npx hardhat verify --network sepolia <CredentialRegistry_Address> <Deployer_EOA> <VerifiedIssuerNFT_Address>
npx hardhat verify --network sepolia <ConsentAudit_Address> <VerifiedIssuerNFT_Address>

# Fantom testnet
npx hardhat verify --network ftmTestnet <VerifiedIssuerNFT_Address> <Deployer_EOA>
npx hardhat verify --network ftmTestnet <WalletRegistry_Address>
npx hardhat verify --network ftmTestnet <CredentialRegistry_Address> <Deployer_EOA> <VerifiedIssuerNFT_Address>
npx hardhat verify --network ftmTestnet <ConsentAudit_Address> <VerifiedIssuerNFT_Address>
```

## 6) Backend Wiring
Set environment variables in backend and restart the server:
```
# Use one of the following RPC URLs depending on target network
EVM_RPC_URL=<generic rpc url, preferred>
EVM_FANTOM_RPC_URL=https://rpc.ankr.com/fantom_testnet
EVM_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/xxxxxxxx
EVM_PRIVATE_KEY=0xabcdef...
EVM_VERIFIER_ADDRESS=<VerifiedIssuerNFT address>
EVM_WALLETREG_ADDRESS=<WalletRegistry address>
EVM_REGISTRY_ADDRESS=<CredentialRegistry address>
EVM_CONSENT_ADDRESS=<ConsentAudit address>
```
Key REST endpoints (Authorization: Bearer <JWT> where required):
- POST /api/evm/org/verify  (admin) → mints VerifiedIssuerNFT to org address
- GET  /api/evm/org/verified/:address → check verification
- POST /api/evm/credential/issue → issue credential (subject, hashHex, uri[, contentHashBytes])
- POST /api/evm/credential/issueBySig → relayed issue using EIP-712 (issuer, subject, hashHex, uri, deadline, v, r, s)
- POST /api/evm/credential/revoke → revoke credential by id
- POST /api/evm/share/grant → time-bound share (credentialId, org, expiresAt)
- POST /api/evm/share/grantBySig → relayed grant using EIP-712 (subject, credentialId, org, expiresAt, deadline, v, r, s)
- POST /api/evm/share/revoke → revoke shareId
- POST /api/evm/consent/log → logConsent(org, credentialId, scopeHashHex, approved)
- POST /api/evm/consent/logBySig → relayed consent using EIP-712 (subject, org, credentialId, scopeHashHex, approved, deadline, v, r, s)
- POST /api/evm/wallet/bind → bind 130-char pubkey hex to caller’s EVM address
- POST /api/evm/wallet/unbind → unbind

## 7) Operational Flow (Sepolia/Fantom)
1. Admin verifies an organization → VerifiedIssuerNFT minted to org EVM address.
2. Subject issues credential: hash of encrypted data + ipfs://CID (or issueCredentialV2 with contenthash).
3. Subject grants time-bound access to specific org address.
4. Subject logs consent (approved/denied) with scopeHash (keccak256 of requested fields list).
5. Explorer: track events on https://sepolia.etherscan.io (Sepolia) or https://testnet.ftmscan.com (Fantom testnet) or https://primordial.bdagscan.com/?chain=EVM (Primordial).

## 8) Data & Security Notes
- Use ipfs://CID for uri and EIP-1577 contenthash (issueCredentialV2) for resolvers.
- Only metadata (hash/URI/contenthash) on-chain; encrypt blobs client-side and pin to IPFS.
- Contracts are Ownable and Pausable; keep deployer key secure or transfer ownership to a multisig.
- Relayed endpoints pay gas from backend signer; consider a dedicated, rate-limited key.
- Verified org enforcement occurs in CredentialRegistry.grantShare and ConsentAudit.logConsent.

## 9) Troubleshooting
- Env not picked up: ensure .env exists in evm/ and hardhat.config.js loads dotenv.
- Verification fails: confirm ETHERSCAN_API_KEY and constructor arguments match.
- Insufficient funds: top up deployer on Sepolia.
- Nonce issues: wait for confirmations or reset account nonce.

## 10) Clean
```bash
npm run clean
```
