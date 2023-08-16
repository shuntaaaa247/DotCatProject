import { useEffect, useState } from "react";
import { CircularProgress } from '@mui/material';
import DotCatNFT from "../../contracts/DotCatNFT.json";
import getContract from "../commonFunctions/getContract";
import restoreNFTInfoFromUri from "../commonFunctions/restoreNFTInfoFromURI";
import { CSSProperties } from "react";
import { Contract } from "ethers";
// import styles from "../styles/nftMint.module.css";

const dotCatCoinAddress: string = "0x0d9F650cDe2D6A8e04B9E7C4Badd9d90B39Ae6c0";
const dotCatNFTAddress:string = "0xcEB79808A09c1a0FAB3d579a678B9073745DEAB1";
const mumbaiChainId: string = "0x13881";
const zeroAddress = "0x0000000000000000000000000000000000000000";

type Props = {
    account: string,
    chainId: string,
    dccAmount: number,
    getDccAmount: () => void;
}

const NftMintButton = ({account, chainId, dccAmount, getDccAmount}:Props) => {
    const [balanceOfNft, setBalanceOfNft] = useState<number>(NaN);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [modalIsOpen, setModelIsOpen] = useState<boolean>(false);
    // const [latestTokenId, setLatestTokenId] = useState<number>(NaN); //NFT発行後にモーダルで発行したNFTの情報を見れるようにするためIDを取得

    const [statusList, setStatusList] = useState<string[]>([]); //発行されたNFTのステータスを格納し、モーダルに表示する。

    useEffect(()=>{
        if (account !== "" && chainId === mumbaiChainId) {
            getBalanceOfNft();
        }
    })

    const getBalanceOfNft = async () => {
        try {
            const dotCatNFTContract = getContract(dotCatNFTAddress, DotCatNFT.abi);
            const nftBalance = await dotCatNFTContract.balanceOf(account);
            setBalanceOfNft(nftBalance.toNumber());
        } catch {
            alert("エラー")
        }
    }

    //NFT発行後にNFTを表示させるためにイベントを取得する(下のgetNFTInfo()もgetStatusAndSVGも実行)
    const catchTransferEvent = (dotCatNFTContract: Contract) => { 
        const filter = dotCatNFTContract.filters.Transfer(zeroAddress, account, null);
        dotCatNFTContract.on(filter, getNFTInfo);//イベントの発行に観察を開始
    }

    const getNFTInfo = async (_from: object, _to: object, _tokenId: object) => {
        getStatusAndSVG(Number(_tokenId));
    }

    const getStatusAndSVG = async (tokenId: number) => {
        const dotCatNFTContract = getContract(dotCatNFTAddress, DotCatNFT.abi);
        const tokenUri = await dotCatNFTContract.tokenURI(tokenId);
        const [level, offensivePower, physicalStrengh, imageUri] = restoreNFTInfoFromUri(tokenUri);
        setStatusList([String(tokenId), level, offensivePower, physicalStrengh, imageUri]);
    }


    const nftMint = async (event: any) => {
        event.preventDefault(); //JSではボタンなどを押すとデフォルトの動作でフォームの内容などをどこかに送信するなどといった動きがあるが、preventDefaultでそれを阻止する。
        try {
            setIsLoading(true); //ローディングの開始
            const dotCatNFTContract = getContract(dotCatNFTAddress, DotCatNFT.abi);
            catchTransferEvent(dotCatNFTContract);//イベント取得状態にして新しいNFTミントを取得しNFTの情報をモーダルに表示する
            const tx = await dotCatNFTContract.mint();
            await tx.wait();
            getDccAmount(); //DCCの残高表示を更新する
            setIsLoading(false);//ローディング終了
            setModelIsOpen(true); //モーダル表示
        } catch(error) {
            setIsLoading(false);
            alert("NFTの発行が中止されました");
        } 
    }

    //モーダルウィンドウ用css
    const modalContent = {
        background: "white",
        padding: "10px",
        borderRadius: "10px",
      };

    const overlay: CSSProperties = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
    
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    };

    if (account === "" || chainId !== mumbaiChainId) {
        return(
            <div className="flex flex-col justify-center items-center">
            <p className="mb-5">ウォレットと連携しMumbaiテストネットに接続してください</p>
            <button disabled className="px-5 py-2 mx-7 my-2 bg-indigo-300 text-xl text-white font-semibold rounded">DotCatNFTを発行する</button>
            </div>
        );
    } else {
        if(isLoading) {
            return(
                <div className="flex justify-center items-center">
                <CircularProgress />
                </div>
            )
        } else {
            if (modalIsOpen) {
                return (
                    <div style={overlay}>
                        <div style={modalContent}>
                            <div>
                                <button className="ml-3 text-5xl" onClick={() => setModelIsOpen(false)}>×</button>
                                <h1 className="pt-5 pb-10 text-center font-bold text-4xl">Your New DotCatNFT</h1>
                                <img src={statusList[4]} className="px-10 py-5 mx-5 bg-slate-100 rounded-md" />
                                <p className="mt-5 text-center font-semibold text-xl">トークンID: {statusList[0]}</p>
                                <p className="mt-1 text-center">レベル: {statusList[1]}</p>
                                <p className="mt-1 text-center">攻撃力: {statusList[2]}</p>
                                <p className="mt-1 mb-5 text-center">体力: {statusList[3]}</p>
                            </div>
                        </div>
                    </div>
                )

            } else {
                if(dccAmount >= 30 || balanceOfNft === 0 ) {
                    return(
                        <div className="flex flex-col justify-center items-center">
                        <button onClick={nftMint} className="px-5 py-2 mx-7 my-2 bg-indigo-500 text-xl text-white font-semibold rounded hover:bg-indigo-600">DotCatNFTを発行する</button>
                        </div>
                    )
                } else  {
                    return(
                        <div className="flex  flex-col items-center">
                        <p>DCCが不足しています</p>
                        <button disabled className="px-5 py-2 mx-7 my-2 bg-indigo-300 text-xl text-white font-semibold rounded">DotCatNFTを発行する</button>
                        </div>
                    )
                }

            }
            
        }
    }
}

export default NftMintButton;