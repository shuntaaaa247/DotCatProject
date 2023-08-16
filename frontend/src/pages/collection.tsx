import Header from "@/components/header";
import { useState, useEffect } from "react";
import getContract from "@/commonFunctions/getContract";
import DotCatNFT from "../../contracts/DotCatNFT.json"
import DotCatCoin from "../../contracts/DotCatCoin.json"
import NftCollection from "@/components/nftCollection";

const dotCatCoinAddress: string = "0x0d9F650cDe2D6A8e04B9E7C4Badd9d90B39Ae6c0";
const dotCatNFTAddress:string = "0xcEB79808A09c1a0FAB3d579a678B9073745DEAB1";
const mumbaiChainId: string = "0x13881";
const zeroAddress = "0x0000000000000000000000000000000000000000";

const Collection = () => {
    const [account, setAccount] = useState<string>("");
    const [chainId, setChainId] = useState<string>("");
    const [dccAmount, setDccAmount] = useState<number>(0);
    const [modalIsOpen, setModalIsOpen] = useState<boolean>(false); //レベル用モーダル(nftDetails.tsx)、

    useEffect(()=> {
        checkMetaMaskisInstalled();
        if (account !== "" && chainId == mumbaiChainId) {
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

    const getDCCAmount = async () => {
        const dotCatCoinContract = getContract(dotCatCoinAddress, DotCatCoin.abi);
        const amount = await dotCatCoinContract.balanceOf(account);
        setDccAmount(amount.toNumber());
    }
    
    const allClear = () => {
        setAccount("");
        setChainId("");
    }

    // const closeModal = () => {
    //     setModalIsOpen(false);
    // }

    const voidFunc1 = (arg: string|number) => {}
    const voidFunc2 = () => {}
    return(
        <>
        <Header connectWallet={ connectWallet } ifWalletConnectiong={ account !== "" ? true : false} dccAmount={dccAmount} currentPage={"collection"}/>
        <div className="w-screen flex justify-center items-center">
            <div className='flex-col'>
                <p className="my-10 py-1 px-3 bg-slate-300 font-semibold rounded-md">Your Wallet Address: {account}</p>
            </div>
        </div>
        <div className="w-screen flex justify-center items-center">
        <div className='flex flex-col items-center'>
        {account !== "" && chainId == mumbaiChainId ? 
        <NftCollection from={"collection"} account={account} setFightingNFTId={voidFunc1} setFightingNFTUri={voidFunc1} closeModal={voidFunc2} getDCCAmount={getDCCAmount}/> : 
        <p>ウォレットと連携しMumbaiテストネットに接続してください</p>
        }
        </div>
        </div>
        </>
    )
}

export default Collection;