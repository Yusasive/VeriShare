# VeriShare BlockDAG Blockchain Library

This library now supports:
- Multi-parent DAG blocks (parents array) with PoW
- LevelDB persistence (DB_PATH, default ./data/blockchain.db)
- Smart contract state persistence for credentials/shares/orgs (CONTRACT_DB_PATH, default ./data/contract.db)
- WebSocket P2P gossip (WS_PORT default 8546, PEERS CSV)

Environment variables:
- DIFFICULTY: mining difficulty (default 2)
- MINING_REWARD: reward amount (default 100)
- DB_PATH: LevelDB path
- WS_PORT: WebSocket port
- PEERS: comma-separated ws://host:port peers

Run standalone node:
- node src/server.js (or docker compose service `blockchain`)
- Health: GET /health, Info: GET /info

Notes:
- Blocks include `parents` for DAG while `previousHash` remains as the primary parent for compatibility.
- Backend integration remains compatible via exported BlockchainService API.
