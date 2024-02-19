import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";

import dotenv from "dotenv";
dotenv.config();

const {
  MAINNET_DEPLOYER_PRIVATE_KEY,
  MAINNET_ARCHIVAL_RPC,
  MUMBAI_PRIVATE_KEY,
  MUMBAI_ARCHIVAL_RPC,
  POLYGON_ARCHIVAL_RPC,
} = process.env;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 10000,
        details: {
          yul: true,
        },
      },
    },
  },
  networks: {
    mumbai: {
      url: `${MUMBAI_ARCHIVAL_RPC}`,
      accounts: [
        `${
          MUMBAI_PRIVATE_KEY ||
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        }`,
      ],
    },
    polygon: {
      url: `${POLYGON_ARCHIVAL_RPC}`,
      accounts: [
        `${
          MAINNET_DEPLOYER_PRIVATE_KEY ||
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        }`,
      ],
    },
    mainnet: {
      url: `${MAINNET_ARCHIVAL_RPC}`,
      accounts: [
        `${
          MAINNET_DEPLOYER_PRIVATE_KEY ||
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        }`,
      ],
    },
  },
  gasReporter: {
    enabled: false,
    coinmarketcap: "1d8cfd2b-c9b6-4884-a5bb-1f0e033b146c",
    outputFile: "gas-report-eth.txt",
    noColors: true,
    currency: "USD",
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      mumbai: process.env.POLYGONSCAN_API_KEY || "",
    },
  },
};

export default config;
