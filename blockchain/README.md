# VeriShare BlockDAG Blockchain Library

This is the core BlockDAG blockchain library for the VeriShare platform, providing decentralized credential management and verification using a directed acyclic graph consensus mechanism.

## Overview

The VeriShare BlockDAG blockchain library enables:

- **Secure Credential Storage**: Encrypted credentials stored on-chain with metadata
- **Decentralized Verification**: Organization verification through blockchain certificates
- **Audit Trails**: Immutable logs of all credential sharing and access events
- **Smart Contracts**: Credential management contracts for access control
- **P2P Network**: Decentralized peer-to-peer communication for consensus

## Architecture

### Components

- **BlockDAG Core**: Directed Acyclic Graph consensus mechanism
- **Credential Contracts**: Smart contracts for credential lifecycle management
- **P2P Network**: WebSocket-based peer-to-peer communication
- **LevelDB Storage**: Persistent storage for blockchain data

### Security Features

- AES-256 encryption for data at rest
- SHA-3 hashing for integrity verification
- ECC-based address generation
- Multi-signature support for enterprise custody

## Getting Started

### Prerequisites

- Node.js (>=16.0.0)
- npm or yarn
- Git

### Installation as a Library

To use the VeriShare blockchain library in your project:

1. Add it as a dependency in your `package.json`:

   ```json
   {
     "dependencies": {
       "verishare-blockchain": "file:../blockchain"
     }
   }
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Import and use in your code:

   ```javascript
   const { BlockchainService } = require("verishare-blockchain");

   const blockchain = new BlockchainService();
   ```

## Programmatic API

### BlockchainService Class

The main interface for interacting with the blockchain:

#### Blockchain Information

- `getChain()` - Get full blockchain
- `getLatestBlock()` - Get the most recent block
- `getBalance(address)` - Get address balance
- `isChainValid()` - Validate blockchain integrity

#### Transactions

- `createTransaction(fromAddress, toAddress, amount, data, type)` - Create new transaction
- `addTransaction(transaction)` - Add transaction to pending pool
- `minePendingTransactions(rewardAddress)` - Mine pending transactions into a block

#### Credentials Management

- `storeCredential(ownerAddress, credentialHash, metadata)` - Store encrypted credential
- `verifyCredential(credentialId, ownerAddress)` - Verify credential ownership
- `shareCredential(credentialId, fromAddress, toAddress, expiryHours)` - Share credential temporarily
- `revokeCredential(credentialId, ownerAddress)` - Revoke credential access
- `getCredentialsByOwner(ownerAddress)` - Get all credentials for an address

#### Organization Verification

- `verifyOrganization(orgAddress)` - Mark organization as verified
- `isOrganizationVerified(orgAddress)` - Check verification status

#### Audit & Compliance

- `getAuditTrail(address)` - Get audit trail for address

#### P2P Network

- `addNode(nodeUrl)` - Register peer node
- `getNodes()` - Get connected nodes
- `resolveConflicts()` - Resolve consensus conflicts

#### Utilities

- `generateAddress()` - Generate new ECC address

## Usage Examples

### Initializing the Blockchain Service

```javascript
const { BlockchainService } = require("verishare-blockchain");

const blockchain = new BlockchainService();
```

### Storing a Credential

```javascript
const credentialId = blockchain.storeCredential(
  "addr_abc123def456",
  "encrypted_hash_of_credential_data",
  {
    type: "student_record",
    institution: "University of Lagos",
    level: "400",
  }
);

console.log(`Credential stored with ID: ${credentialId}`);
```

### Verifying an Organization

```javascript
blockchain.verifyOrganization("org_university_of_lagos");

const isVerified = blockchain.isOrganizationVerified("org_university_of_lagos");
console.log(`Organization verified: ${isVerified}`);
```

### Sharing a Credential

```javascript
const share = blockchain.shareCredential(
  "cred_123456789",
  "addr_abc123def456",
  "org_nysc_verifier",
  48 // expiry in hours
);

console.log(`Credential shared:`, share);
```

### Creating and Mining Transactions

```javascript
// Create a transaction
const transaction = blockchain.createTransaction(
  "from_address",
  "to_address",
  100,
  "Credential verification payment",
  "credential"
);

blockchain.addTransaction(transaction);

// Mine pending transactions
const newBlock = blockchain.minePendingTransactions("miner_reward_address");
console.log(`Block mined:`, newBlock);
```

## Configuration

### Environment Variables

Create a `.env` file in your project directory (where you're using the library):

```env
NODE_ENV=development
DIFFICULTY=2
MINING_REWARD=100
SECRET_KEY=your_secret_key_here
DB_PATH=./data/blockchain.db
```

### Blockchain Configuration

- **Difficulty**: Mining difficulty level (default: 2)
- **Mining Reward**: Block reward amount (default: 100)
- **Database Path**: Where blockchain data is stored (default: ./data/blockchain.db)

## Smart Contracts

### Credential Contract

The credential contract provides:

- **storeCredential()**: Store encrypted credential hash
- **verifyCredential()**: Verify credential ownership
- **shareCredential()**: Grant temporary access to another address
- **revokeCredential()**: Revoke credential access
- **verifyOrganization()**: Mark organization as verified

### Transaction Types

- `transfer`: Standard token transfers
- `credential`: Credential-related transactions
- `reward`: Mining rewards
- `contract`: Smart contract executions

## Consensus Mechanism

The BlockDAG uses a simplified proof-of-work consensus:

1. **Block Creation**: New blocks reference the latest block hash
2. **Mining**: Proof-of-work with adjustable difficulty
3. **Validation**: All transactions and blocks are cryptographically verified
4. **Conflict Resolution**: Longest chain rule for consensus

## Security Standards

- **NIST SP 800-53**: Security controls compliance
- **ISO 27001**: Information security management
- **GDPR**: Data protection and privacy
- **AES-256**: Data encryption standard

## Testing

Run the test suite:

```bash
npm test
```

## Integration

The blockchain library is designed to be integrated into larger applications:

### Backend Integration

Use the library in your Express.js or other Node.js backend:

```javascript
const express = require("express");
const { BlockchainService } = require("verishare-blockchain");

const app = express();
const blockchain = new BlockchainService();

// Use blockchain methods in your routes
app.post("/api/credentials", (req, res) => {
  const { ownerAddress, credentialHash, metadata } = req.body;
  const credentialId = blockchain.storeCredential(
    ownerAddress,
    credentialHash,
    metadata
  );
  res.json({ credentialId });
});
```

### Database Considerations

The library uses LevelDB for persistent storage. Ensure your deployment environment has appropriate permissions for the database directory.

## Monitoring

Monitor the blockchain library through your application:

- **Health Check**: Use `blockchain.isChainValid()` to verify integrity
- **Blockchain Info**: Use `blockchain.getChain().length` for chain length
- **Performance**: Monitor method execution times in your application logs
- **Logs**: Console logging is built into the library methods

## Contributing

1. Follow the existing code structure
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure security best practices
5. Test on multiple environments

## Troubleshooting

### Common Issues

- **Import errors**: Ensure the library is properly installed as a dependency
- **Database permissions**: Check write permissions for the DB_PATH directory
- **Genesis block errors**: Verify the data directory exists and is writable
- **Mining issues**: Adjust DIFFICULTY in .env file
- **Memory usage**: Monitor heap usage for large blockchains

### Debugging

- Enable verbose logging by setting NODE_ENV=development
- Check blockchain integrity with `blockchain.isChainValid()`
- Verify database connectivity by attempting to store a test credential

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the API examples

---

**Version**: 1.0.0
**BlockDAG Protocol**: VeriShare v1
**Compatible with**: VeriShare Backend & Frontend
