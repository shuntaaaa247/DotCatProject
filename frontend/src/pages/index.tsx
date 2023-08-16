import Link from 'next/link'
import { useState, useEffect, cache } from 'react';
import Header from '../components/header';
import NftMintButton from '../components/nftMintButton'
import DotCatCoin from "../../contracts/DotCatCoin.json";
import { useRouter } from 'next/router';
import getContract from '../commonFunctions/getContract';


const dotCatCoinAddress: string = "0x0d9F650cDe2D6A8e04B9E7C4Badd9d90B39Ae6c0";
const mumbaiChainId: string = "0x13881";

declare global {
  interface Window {
    ethereum: any;
  }
}

const Home = () => {
  const router = useRouter();

  //Linkコンポーネントにより画面遷移によりこのページにアクセスしたときqueryからacount(chianId)を取得する。ページを更新した場合はqueryがないので""になる。
  // const passedAccount: string = router.query.account ? String(router.query.account) : "";
  // const passedChainId: string = router.query.chainId ? String(router.query.chainId) : "";

  // const [account, setAccount] = useState<string>(passedAccount);
  // const [chainId, setChainId] = useState<string>(passedChainId);

  const [account, setAccount] = useState<string>("");
  const [chainId, setChainId] = useState<string>("");
  const [dccAmount, setDccAmount] = useState<number>(0);

  useEffect(()=> {
    checkMetaMaskisInstalled();
    if (account !== "" && chainId === mumbaiChainId) {
      getDCCAmount();
    }
  })

  const checkMetaMaskisInstalled = () => {
    if (window.ethereum) {
      console.log("MetaMaskはインストールされています");

      window.ethereum.on('accountsChanged', allClear); //ユーザーがアカウントを切り替えた時のために、accountsChangedイベント指定
      //ユーザーがネットワークを切り替えた時のために、chainChangedイベント指定
      window.ethereum.on('chainChanged', allClear);
    } else {
      console.log("MetaMaskをインストールしてください");
    }
  }

  const connectWallet = async () => {
    checkMetaMaskisInstalled();
    getAccount();
    getChainId();
  }

  const getAccount = async () => {
    try{
      const accounts = await window.ethereum.request({method: "eth_requestAccounts"});
      setAccount(accounts[0]);
    } catch {
      console.log("Error getting MetaMask Account");
    }
  }

  const getChainId = async () => {
    try {
      const chain = await window.ethereum.request({method: "eth_chainId"});
      setChainId(chain);
    } catch {
      console.log("Error getting chainId");
    }
  }

  const allClear = () => {
    setAccount("");
    setChainId("");
  }

  const getDCCAmount = async () => {
    try {
      const dotCatCoinContract = getContract(dotCatCoinAddress, DotCatCoin.abi);
      const amount = await dotCatCoinContract.balanceOf(account);
      console.log(amount.toNumber());
      setDccAmount(amount.toNumber());
    } catch {
      alert("エラー");
    }
  }

  return (
    <>
    <Header connectWallet={ connectWallet } ifWalletConnectiong={ account !== "" ? true : false} dccAmount={dccAmount} currentPage={"home"}/>
    <main>
      <div className="w-screen flex flex-col justify-center items-center">
        <p className="my-10 py-1 px-3 bg-slate-300 font-semibold rounded-md">Your Wallet Address: {account}</p>
        <h1 className='text-7xl font-semibold'>Dot Cat <span className='text-red-500'>NFT</span> Battle</h1>
        <p>NFT育成型なんちゃってブロックチェーンゲーム</p>

        <h2 className='text-4xl font-bold mt-20 mb-7'>Dot Cat NFT Battleとは</h2>
        <p>Dot Cat NFT Battleは、ドットで描かれるランダムな配色のジェネラティブNFTをバトルさせ、育成するなんちゃってブロックチェーンゲームです。
        <br />
        バトルに勝利すると、NFTの発行や育成に使えるDCC(Dot Cat Coin)を発行することができます。
        <br />本サイトはMetaMaskとPolygon Mumbai Testnetにより利用でき、NFT、コインの発行、NFTのレベルアップにはガス代がかかります。
        <br />テスト用通貨取得には<Link href={"https://mumbaifaucet.com/"}><span className='underline'>MUMBAI FAUCET</span></Link>をご利用ください</p>

        <h2 className='text-4xl font-bold mt-20 mb-7'>スマートコントラクト</h2>
        <p>このサイトでは
        <Link href={"https://mumbai.polygonscan.com/address/0xcEB79808A09c1a0FAB3d579a678B9073745DEAB1"}><span className='underline'>DotCatNFT(ERC721)用のスマートコントラクト</span></Link>と<br />
        <Link href={"https://mumbai.polygonscan.com/address/0x0d9F650cDe2D6A8e04B9E7C4Badd9d90B39Ae6c0"}><span className='underline'>DotCatCoin(ERC20)用のスマートコントラクト</span></Link>を使用しています。</p>

        <h2 className='text-4xl font-bold mt-20 mb-7'>新たなDot Cat NFTをゲットしよう</h2>
        <p className='mb-3'>初回のみ0DCC、それ以降は1回につき30（×10<sup>-18</sup>）DCCが必要です。</p>
        <NftMintButton account={account} chainId={chainId} dccAmount={dccAmount} getDccAmount={getDCCAmount} />
        <Link href={"https://testnets.opensea.io/collection/dotcatnft-1"}><p className='mb-20 underline'>Testnet OpenseaでDotCatNFTを見る</p></Link>

        
      </div>
    </main>
    </>
  )
}

export default Home