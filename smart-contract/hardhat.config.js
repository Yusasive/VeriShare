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
  AWAKENING_RPC_URL,
  AWAKENING_CHAIN_ID,
  PRIVATE_KEY,
  ETHERSCAN_API_KEY,
  POLYGONSCAN_API_KEY,
  FTMSCAN_API_KEY,
} = process.env;

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    // Ethereum Testnet
    sepolia: {
      url: SEPOLIA_RPC_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },

    // Polygon Amoy Testnet
    amoy: {
      url: AMOY_RPC_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },

    // Polygon Mainnet
    polygon: {
      url: POLYGON_RPC_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },

    // Ethereum Mainnet
    mainnet: {
      url: MAINNET_RPC_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },

    // Fantom Testnet
    ftmTestnet: {
      url: FTM_TESTNET_RPC_URL || "",
      chainId: 4002,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },

    // Fantom Mainnet
    opera: {
      url: OPERA_RPC_URL || "",
      chainId: 250,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },

    // BlockDAG Primordial (legacy testnet)
    primordial: {
      url: PRIMORDIAL_RPC_URL || "https://rpc.primordial.bdagscan.com",
      chainId: PRIMORDIAL_CHAIN_ID ? Number(PRIMORDIAL_CHAIN_ID) : 1043,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },

    // BlockDAG Awakening (current testnet)
    awakening: {
      url: AWAKENING_RPC_URL || "https://rpc.awakening.bdagscan.com",
      chainId: AWAKENING_CHAIN_ID ? Number(AWAKENING_CHAIN_ID) : 1043, // placeholder, confirm from docs
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },

  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_API_KEY || "",
      sepolia: ETHERSCAN_API_KEY || "",
      polygon: POLYGONSCAN_API_KEY || "",
      polygonAmoy: POLYGONSCAN_API_KEY || "",
      ftmTestnet: FTMSCAN_API_KEY || "",
      opera: FTMSCAN_API_KEY || "",
      primordial: "", // no API key needed
      awakening: "", // awaiting official API
    },
    customChains: [
      {
        network: "primordial",
        chainId: 1043,
        urls: {
          apiURL: "https://primordial.bdagscan.com/api",
          browserURL: "https://primordial.bdagscan.com",
        },
      },
      {
        network: "awakening",
        chainId: AWAKENING_CHAIN_ID ? Number(AWAKENING_CHAIN_ID) : 7999,
        urls: {
          apiURL: "https://awakening.bdagscan.com/api",
          browserURL: "https://awakening.bdagscan.com",
        },
      },
    ],
  },


  sourcify: {
    enabled: true,
  },
};
