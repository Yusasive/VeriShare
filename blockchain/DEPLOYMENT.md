# VeriShare BlockDAG Deployment Guide

This guide explains how to run the VeriShare BlockDAG node locally and in multi-node (docker-compose) setups.

## 1. Prerequisites
- Node.js 18+
- npm
- Docker & Docker Compose (for multi-node)

## 2. Local Library Usage
The blockchain is packaged as a library used by the backend. To use it:

1. Install from local path in backend/package.json:
   "verishare-blockchain": "file:../blockchain"
2. npm install in backend
3. Ensure .env includes DIFFICULTY, MINING_REWARD as needed

## 3. Running a Development Node (Docker)
A sample service is defined in the root docker-compose.yml as `blockchain`.

Environment variables:
- NODE_ENV: development|production
- PORT: RPC port (default 8545)
- NETWORK_ID: chain ID (e.g., 1337)
- GENESIS_BLOCK: JSON string of genesis block
- DB_PATH: LevelDB path for blockchain DAG (default ./data/blockchain.db)
- CONTRACT_DB_PATH: LevelDB path for contract state (default ./data/contract.db)
- WS_PORT, PEERS: P2P settings
- DIFFICULTY, MINING_REWARD

Expose ports:
- 8545 HTTP RPC
- 8546 WebSocket P2P (if enabled)

Start:
- docker compose up -d blockchain
- Health check: curl http://localhost:8545/health

## 4. Multi-Node Topology
Spin multiple blockchain services with different PORT/volumes:

services:
  blockchain1:
    build: ./blockchain
    environment:
      PORT: 8545
      NETWORK_ID: 1337
    ports: ["8545:8545"]
    volumes: ["blockchain_data1:/app/data"]

  blockchain2:
    build: ./blockchain
    environment:
      PORT: 8645
      NETWORK_ID: 1337
    ports: ["8645:8545"]
    volumes: ["blockchain_data2:/app/data"]

The nodes will discover/register peers through the backend API (`/api/blockchain/nodes/register`) or a future P2P layer.

## 5. Genesis Initialization
Use blockchain/scripts/initGenesis.js to emit a genesis template:
- npm run --workspace blockchain init-genesis
- Set GENESIS_BLOCK env accordingly in docker-compose or container env

## 6. Persistence
The blockchain uses LevelDB (configured internally) under ./data by default. Mount a volume to persist.

## 7. Upgrading
- Stop node
- Pull new image or rebuild
- Start; integrity validated by `isChainValid()`

## 8. Observability
- Set NODE_ENV=development for verbose logs
- Integrate container logs with your log stack (e.g., Loki/ELK)

## 9. Security
- Run behind a reverse proxy (TLS termination)
- Restrict RPC to trusted networks
- Rotate containers regularly and keep dependencies updated

## 10. Troubleshooting
- Consensus: call /api/blockchain/consensus via backend to validate dag
- Pending TX never mined: ensure you POST /api/blockchain/mine with a reward address
- Permission errors: verify data directory writable

