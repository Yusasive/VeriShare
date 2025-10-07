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

## API Endpoints

- `GET /` - Health check endpoint returning a welcome message.

More endpoints will be added as the API is developed.
