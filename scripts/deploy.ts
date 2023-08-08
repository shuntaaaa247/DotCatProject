import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();
import dotCatCoinArtifacts from "../artifacts/contracts/DotCatCoin.sol/DotCatCoin.json";
import dotCatNFTArtifacts from "../artifacts/contracts/DotCatNFT.sol/DotCatNFT.json";

async function main() {
  const privateKey: string = process.env.PRIVATE_KEY ?? "";
  if (privateKey === "") {
    throw new Error("No value set Environment variable PRIVATE_KEY");
  }

  const rpcUrl: string = process.env.MUMBAI_URL ?? ""; 
  if (rpcUrl === "") {
      throw new Error("No value set Environment variable MUMBAI_URL"); 
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);

  const dotCatCoinFactory = new ethers.ContractFactory(dotCatCoinArtifacts.abi, dotCatCoinArtifacts.bytecode, signer);
  const dotCatCoinContract = await dotCatCoinFactory.deploy();
  console.log(`DotCatCoin contract deploy address ${await dotCatCoinContract.getAddress()}`);
  await dotCatCoinContract.waitForDeployment();
  console.log("Deployment of CoinContract complited");

  const dotCatNFTFactory = new ethers.ContractFactory(dotCatNFTArtifacts.abi, dotCatNFTArtifacts.bytecode, signer);
  const dotCatNFTContract = await dotCatNFTFactory.deploy(await dotCatCoinContract.getAddress());
  console.log(`DotCatNFT contract deploy address ${await dotCatNFTContract.getAddress()}`);
  await dotCatNFTContract.waitForDeployment();
  console.log("Deployment of NFTContract complited");
}

//DotCatCoin Contract Address: 0x0d9F650cDe2D6A8e04B9E7C4Badd9d90B39Ae6c0
//DotCatNFT Contract Address: 0xcEB79808A09c1a0FAB3d579a678B9073745DEAB1

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
