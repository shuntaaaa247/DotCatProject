import Header from "@/components/header";
import { CSSProperties, useEffect, useState } from "react";
import Link from "next/link";
import getContract from "../commonFunctions/getContract";
import DotCatCoin from "../../contracts/DotCatCoin.json";
import NftCllection from "../components/nftCollection"
import restoreNFTInfoFromUri from "../commonFunctions/restoreNFTInfoFromURI";
import BattleScene from "../components/battleScene";


const dotCatCoinAddress: string = "0x0d9F650cDe2D6A8e04B9E7C4Badd9d90B39Ae6c0";
const dotCatNFTAddress:string = "0xcEB79808A09c1a0FAB3d579a678B9073745DEAB1";
const mumbaiChainId: string = "0x13881";
const zeroAddress = "0x0000000000000000000000000000000000000000";

const Battle = () => {
    const [account, setAccount] = useState<string>("");
    const [chainId, setChainId] = useState<string>("");
    const [dccAmount, setDccAmount] = useState<number>(0);
    const [modelIsOpen, setModalIsOpen] = useState<boolean>(false);
    const [isFighting, setIsFighting] = useState<boolean>(false);
    const [fightingNFTId, setFightingNFTId] = useState<number>(NaN);
    const [fightingNFTUri, setFightingNFTUri] = useState<string>("");

    useEffect(()=> {
        checkMetaMaskisInstalled();
        if (account !== "" && chainId == mumbaiChainId) {
            getDCCAmount();
        }
        if (fightingNFTUri !== "") {
            setIsFighting(true)
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
        try {
            const dotCatCoinContract = getContract(dotCatCoinAddress, DotCatCoin.abi);
            const amount = await dotCatCoinContract.balanceOf(account);
            console.log(amount.toNumber());
            setDccAmount(amount.toNumber());   
        } catch {
            alert("Mumbaiが選択されていない可能性があります")
        }
    }
    
    const allClear = () => {
        setAccount("");
        setChainId("");
    }

    //css
    const modalContent: CSSProperties = {
        background: "white",
        marginTop: "30px",
        marginRight: "auto",
        marginLeft: "auto",
        marginBottom: "30px",
        padding: "10px",
        borderRadius: "10px",
        width: "75%",
      };

    const overlay: CSSProperties = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
    
        // display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflowY: "scroll",
    };

    const _setFightingNFTId = (tokenId: number) => {
        setFightingNFTId(tokenId);
    }
    const _setFightingNFTUri = (uri: string) => {
        setFightingNFTUri(uri);
    }
    const _closeModal = () => {
        setModalIsOpen(false)
    }

    const closeBattle = () => {
        setIsFighting(false);
        setIsFighting(false);
        setFightingNFTUri("")
    }

    if (isFighting) {
        return(
        <>
            <Header connectWallet={connectWallet} ifWalletConnectiong={ account !== "" ? true : false} dccAmount={dccAmount} currentPage={"battle"}/>
            <main>
            {account !== "" ? 
                <div className="flex flex-col items-center">
                <BattleScene 
                    status={[fightingNFTId, Number(restoreNFTInfoFromUri(fightingNFTUri)[0]), Number(restoreNFTInfoFromUri(fightingNFTUri)[1]), Number(restoreNFTInfoFromUri(fightingNFTUri)[2])]} 
                    imageUri={restoreNFTInfoFromUri(fightingNFTUri)[3]} 
                    closeBattle={closeBattle}
                />
                <button onClick={closeBattle} className="px-5 py-2 my-5 bg-slate-500 text-xl text-white font-semibold rounded hover:bg-slate-600">バトルを終了する</button></div> :
                <div>
                <p>アカウントが切り替わったため、バトルが終了しました。ページを更新してください</p>
                </div>
            }   
            </ main>
        </>   
        )
    } else {
        return(
            <>
            <Header connectWallet={connectWallet} ifWalletConnectiong={ account !== "" ? true : false} dccAmount={dccAmount} currentPage={"battle"}/>
            <main>
              <div className="w-screen flex justify-center items-center">
                <div className='flex-col'>
                  <p className="my-10 py-1 px-3 bg-slate-300 font-semibold rounded-md">Your Wallet Address: {account}</p>
                  
                </div>
              </div>
              <div className="w-screen flex justify-center">
                <div className='flex flex-col items-center'>
                {account !== "" && chainId === mumbaiChainId ? 
                    (modelIsOpen ? <div style={overlay}><div style={modalContent}><NftCllection from={"battle"} account={account} setFightingNFTId={_setFightingNFTId} setFightingNFTUri={_setFightingNFTUri} closeModal={_closeModal} getDCCAmount={getDCCAmount}/></div></div> : <button onClick={() => setModalIsOpen(true)} className="px-5 py-2 mx-7 my-2 bg-indigo-500 text-xl text-white font-semibold rounded hover:bg-indigo-600">バトルする</button>) :
                    <>
                    <p>ウォレットと連携しMumbaiテストネットに接続してください</p>
                    <button disabled className="px-5 py-2 mx-7 my-10 bg-indigo-300 text-xl text-white font-semibold rounded">バトルする</button>
                    </>
                }
                </div>
              </div>
            </main>
            </>
        )
    }
}

export default Battle;