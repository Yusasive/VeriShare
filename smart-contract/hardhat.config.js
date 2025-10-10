require("dotenv").config();
require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const {
  SEPOLIA_RPC_URL,
  AMOY_RPC_URL,
  POLYGON_RPC_URL,
  MAINNET_RPC_URL,
  FTM_TESTNET_RPC_URL,
  OPERA_RPC_URL,
  PRIMORDIAL_RPC_URL,
  PRIMORDIAL_CHAIN_ID,
  PRIVATE_KEY,
  ETHERSCAN_API_KEY,
  POLYGONSCAN_API_KEY,
  FTMSCAN_API_KEY
} = process.env;

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: { optimizer: { enabled: true, runs: 200 } }
  },
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    },
    amoy: { // Polygon Amoy testnet
      url: AMOY_RPC_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    },
    polygon: {
      url: POLYGON_RPC_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    },
    mainnet: {
      url: MAINNET_RPC_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    },
    ftmTestnet: {
      url: FTM_TESTNET_RPC_URL || "",
      chainId: 4002,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    },
    opera: {
      url: OPERA_RPC_URL || "",
      chainId: 250,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    },
    primordial: {
      url: PRIMORDIAL_RPC_URL || "",
      chainId: PRIMORDIAL_CHAIN_ID ? Number(PRIMORDIAL_CHAIN_ID) : undefined,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_API_KEY || "",
      sepolia: ETHERSCAN_API_KEY || "",
      polygon: POLYGONSCAN_API_KEY || "",
      polygonAmoy: POLYGONSCAN_API_KEY || "",
      ftmTestnet: FTMSCAN_API_KEY || "",
      opera: FTMSCAN_API_KEY || ""
    },
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com"
        }
      },
      {
        network: "ftmTestnet",
        chainId: 4002,
        urls: {
          apiURL: "https://api-testnet.ftmscan.com/api",
          browserURL: "https://testnet.ftmscan.com"
        }
      },
      {
        network: "opera",
        chainId: 250,
        urls: {
          apiURL: "https://api.ftmscan.com/api",
          browserURL: "https://ftmscan.com"
        }
      }
    ]
  }
};
