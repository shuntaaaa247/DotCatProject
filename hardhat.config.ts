import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks: {
      mumbai: {
          url: process.env.MUMBAI_URL,
          accounts: [String(process.env.PRIVATE_KEY)],
      },
  },
  etherscan: {
      apiKey: process.env.POLYGONSCAN_API,
  },
};

export default config;
