# Backend Module

Setup instructions for the backend module.

## Installation

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file based on the provided template and update the values as needed.

4. Ensure MongoDB is running locally or update the `MONGO_URI` in `.env` to point to your MongoDB instance.

## Running the Server

- For production:

  ```bash
  npm start
  ```

- For development (with auto-reload):
  ```bash
  npm run dev
  ```

The server will start on `http://localhost:5000` by default.

## Configuration

Environment variables:
- MONGO_URI or DATABASE_URL: Mongo connection
- JWT_SECRET, JWT_EXPIRES_IN: Auth token settings
- CORS_ORIGIN: CORS allowed origins (CSV or "*")
- ADMIN_ADDRESSES: CSV of admin wallet addresses (uncompressed secp256k1 public keys)
- IPFS_API_URL, IPFS_API_KEY: Optional for credential IPFS anchoring

## API Endpoints

See docs/API_SPEC.md for the full list, and interactive docs at /docs when server is running.
- Blockchain credential store/share/revoke and organization verification (admin-only)
- Consent requests and the new QR/token flow for verified organizations
- Organization apply/review endpoints for the developer portal
- Compliance report (owner-authenticated)
