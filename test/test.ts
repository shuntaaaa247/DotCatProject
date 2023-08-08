import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

const {
  constants,
} = require('@openzeppelin/test-helpers');

async function deployContractFixture() {
  const [owner, account1] = await ethers.getSigners();
  const dotCatCoin = await ethers.deployContract("/contracts/DotCatCoin.sol:DotCatCoin", owner);
  await dotCatCoin.waitForDeployment();
  console.log(await dotCatCoin.getAddress());
  const contractAddress = await dotCatCoin.getAddress();

  const dotCatNFT = await ethers.deployContract("/contracts/DotCatNFT.sol:DotCatNFT", [contractAddress]);
  await dotCatCoin.waitForDeployment();
  await dotCatCoin.setDotCatNFTAddress(await dotCatNFT.getAddress());

  return {dotCatCoin, dotCatNFT, owner, account1};
}

describe("test", function() {
  it("_dotCatNFTContractAddressにはDotCatNFTコントラクトのアドレスが入っているべき", async function() {
    const { dotCatCoin, dotCatNFT, owner, account1 } = await loadFixture(deployContractFixture);
    expect(await dotCatCoin.getDotCatNFTAddress()).to.equal(await dotCatNFT.getAddress());
  });

  it("DotCatNFTからDotCatCoinのbalanceOf()を呼び出すことができるべき", async function() {
    const { dotCatCoin, dotCatNFT, owner, account1 } = await loadFixture(deployContractFixture);
    expect(await dotCatNFT.balanceOf(owner)).to.equal(0);
  });

  it("Coinコントラクトからの直接のmint()は失敗するべき", async function() {
    const { dotCatCoin, dotCatNFT, owner, account1 } = await loadFixture(deployContractFixture);
    await expect(dotCatCoin.mint(owner.address, 30)).to.rejectedWith("DotCatCoin.sol: msg.sender in DotCatCoin Contract should be DotCatNFT Contract Address");
    await expect(dotCatCoin.mint(account1.address, 30)).to.rejectedWith("DotCatCoin.sol: msg.sender in DotCatCoin Contract should be DotCatNFT Contract Address");
  })

  it("NFTコントラクトから、Coinコントラクトのmint()は実行できるべき", async function() {
    const { dotCatCoin, dotCatNFT, owner, account1 } = await loadFixture(deployContractFixture);
    await dotCatNFT.mintDCCFromDCAT(30);
    await dotCatNFT.connect(account1).mintDCCFromDCAT(30);
    expect(await dotCatCoin.balanceOf(owner.address)).to.equal(30);
    expect(await dotCatCoin.balanceOf(account1.address)).to.equal(30);
  });

  it("Coinコントラクトからの直接のburn()は失敗するべき", async function() {
    const { dotCatCoin, dotCatNFT, owner, account1 } = await loadFixture(deployContractFixture);
    await expect(dotCatCoin.burn(owner.address, 30)).to.rejectedWith("DotCatCoin.sol: msg.sender in DotCatCoin Contract should be DotCatNFT Contract Address");
    await expect(dotCatCoin.burn(account1.address, 30)).to.rejectedWith("DotCatCoin.sol: msg.sender in DotCatCoin Contract should be DotCatNFT Contract Address");
  });

  it("NFT無所持の状態では、0DCCでもNFTをmintできるべき、またtokenIdはインクリメントされるべき", async function() {
    const { dotCatCoin, dotCatNFT, owner, account1 } = await loadFixture(deployContractFixture);
    expect(await dotCatNFT.balanceOf(owner.address)).to.equal(0);
    await expect(dotCatNFT.mint()).to.emit(dotCatNFT, "Transfer").withArgs(constants.ZERO_ADDRESS, owner.address, 1);
    expect(await dotCatNFT.balanceOf(owner.address)).to.equal(1);

    expect(await dotCatNFT.balanceOf(account1.address)).to.equal(0);
    await expect(dotCatNFT.connect(account1).mint()).to.emit(dotCatNFT, "Transfer").withArgs(constants.ZERO_ADDRESS, account1.address, 2);
    expect(await dotCatNFT.balanceOf(account1.address)).to.equal(1);
  });

  it("NFT所持の場合は、DCC不足でNFTmintに失敗するべき", async function() {
    const { dotCatCoin, dotCatNFT, owner, account1 } = await loadFixture(deployContractFixture);
    await dotCatNFT.mint();
    await dotCatNFT.connect(account1).mint();
    await expect(dotCatNFT.mint()).to.rejectedWith("ERC20: burn amount exceeds balance");
    await expect(dotCatNFT.connect(account1).mint()).to.rejectedWith("ERC20: burn amount exceeds balance");
    expect(await dotCatNFT.balanceOf(owner.address)).to.equal(1);
  });

  it("NFTを所持&DCCが足りている場合はNFTのmint()が実行できるべき、そして同時にDCCがburnされるべき", async function() {
    const { dotCatCoin, dotCatNFT, owner, account1 } = await loadFixture(deployContractFixture);
    await dotCatNFT.mintDCCFromDCAT(100);
    await dotCatNFT.connect(account1).mintDCCFromDCAT(100);
    await dotCatNFT.mint();
    await dotCatNFT.connect(account1).mint();
    await expect(dotCatNFT.mint()).to.emit(dotCatNFT, "Transfer").withArgs(constants.ZERO_ADDRESS, owner.address, 3);
    await expect(dotCatNFT.connect(account1).mint()).to.emit(dotCatNFT, "Transfer").withArgs(constants.ZERO_ADDRESS, account1.address, 4);
    expect(await dotCatCoin.balanceOf(owner.address)).to.equal(70);
    expect(await dotCatCoin.balanceOf(account1.address)).to.equal(70);
  });

  it("DCCが足りていれば、NFTはレベルアップできるべき", async function() {
    const { dotCatCoin, dotCatNFT, owner, account1 } = await loadFixture(deployContractFixture);
    await dotCatNFT.mintDCCFromDCAT(100);
    await dotCatNFT.mint();
    restoreInfoFromUri(await dotCatNFT.tokenURI(1));
    expect(await dotCatNFT.levelUp(1));
    restoreInfoFromUri(await dotCatNFT.tokenURI(1));
  });

  it("DCCが足りなければ、NFTのレベルアップは失敗するべき", async function() {
    const { dotCatCoin, dotCatNFT, owner, account1 } = await loadFixture(deployContractFixture);
    await dotCatNFT.mint();
    await expect(dotCatNFT.levelUp(1)).to.revertedWith("ERC20: burn amount exceeds balance");
  })
});

//uriをmetadataに復元し, svg, ステータスを取得
const restoreInfoFromUri = (uri: string) => {
  const encodedMetadata: string = uri.split(",")[1];
  const metadata: string = atob(encodedMetadata);//base64でデコード
  console.log(metadata);

  //ステータス取得
  const level: number = Number(metadata.split(': ')[3].split('"')[1]);//レベルの取得
  const offensivePower: number = Number(metadata.split(': ')[4].split('"')[1]);
  const physicalStrengh: number = Number(metadata.split(': ')[5].split('"')[1]);

  //svg取得
  const imageUri: string = metadata.split(': ')[1].split('"')[1];
  const encodedSvg: string = imageUri.split(",")[1];
  const svg: string = atob(encodedSvg);//base64でデコード

  console.log(`レベル：${level} 攻撃力：${offensivePower} 体力：${physicalStrengh}`);
  console.log(`SVG:${svg}`);
}
