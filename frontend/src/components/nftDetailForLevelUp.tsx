import getContract from "@/commonFunctions/getContract"
import DotCatNFT from "../../contracts/DotCatNFT.json"
import DotCatCoin from "../../contracts/DotCatCoin.json"
import { useState, useEffect } from "react";
import restoreNFTInfoFromUri from "@/commonFunctions/restoreNFTInfoFromURI";
import { CircularProgress } from "@mui/material";

const dotCatCoinAddress: string = "0x0d9F650cDe2D6A8e04B9E7C4Badd9d90B39Ae6c0";
const dotCatNFTAddress:string = "0xcEB79808A09c1a0FAB3d579a678B9073745DEAB1";
const mumbaiChainId: string = "0x13881";
const zeroAddress = "0x0000000000000000000000000000000000000000";

type Props = {
    account: string
    tokenId: number
    closeModalForNFLevelUp: () => void
    getDCCAmount: ()=> void //レベルアップ後にDCCの残高表示をリセットするため
}

const NftDetailForLevelUp = ({account, tokenId, closeModalForNFLevelUp, getDCCAmount}: Props) => {
    const [status, setStatus] = useState<number[]>([]);
    const [imageUri, setImageUri] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [cost, setCost] = useState<number>(NaN);
    const [currentDCCAmount, setCurrentDCCAmount] = useState<number>(NaN); //ユーザーがレベルアップに必要なDCCを所有しているか確認するためのstate。propsで持ってきてもよかったけどちょっと面倒だった。

    useEffect(() => {
        getDetail();
        getCurrentDCCAmount();
    }, [isLoading])

    const getCurrentDCCAmount = async () => { //レベルアップに必要なDCCを所有しているか確認するために現在のDCC残高を取得。getDCCAmount()とは別物
        const dotCatNFTContract = getContract(dotCatCoinAddress, DotCatCoin.abi);
        setCurrentDCCAmount(await dotCatNFTContract.balanceOf(account))
    }

    const getDetail = async () => {
        const dotCatNFTContract = getContract(dotCatNFTAddress, DotCatNFT.abi);
        const uri: string = await dotCatNFTContract.tokenURI(tokenId);
        const [level, offensivePower, physicalStrengh, imageUri] = restoreNFTInfoFromUri(uri)
        setStatus([Number(level), Number(offensivePower), Number(physicalStrengh)]);
        setImageUri(imageUri);
        setCost(2+Number(level)); //レベルアップには現在のレベル+2のDCCが必要
    }

    const levelUp = async () => {
        try {
            setIsLoading(true)
            const dotCatNFTContract = getContract(dotCatNFTAddress, DotCatNFT.abi);
            const tx = await dotCatNFTContract.levelUp(tokenId);
            await tx.wait();
            getDCCAmount()
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            alert("エラーが発生しました");
        }
    }
    

    return(
        <>
        <button className="text-3xl mr-auto ml-2" onClick={closeModalForNFLevelUp}>×</button>
        <p className="mt-5 my-4 text-center font-semibold text-3xl">TokenID: {tokenId}</p>
        <img src={imageUri} className="px-10 py-5 mx-5 bg-slate-100 rounded-md" />
        {isLoading ? <p className="my-7"><CircularProgress /></p> : 
        <>
        <p className="mt-3 mb-1 text-center font-semibold">レベル: {status[0]}</p>
        <p className="mt-1 text-center font-semibold">攻撃力: {status[1]}</p>
        <p className="mt-1 text-center font-semibold">体力: {status[2]}</p>
        <p className="mb-5 font-semibold">コスト: {cost} （×10<sup>-18</sup>） DCC</p>

        {currentDCCAmount >= cost ? 
        <button onClick={levelUp} className="px-5 py-2 mx-7 mb-3 bg-green-600 text-xl text-white font-semibold rounded hover:bg-green-700">レベルアップ</button> : 
        <button disabled onClick={levelUp} className="px-5 py-2 mx-7 mb-3 bg-green-300 text-xl text-white font-semibold rounded">レベルアップ</button>
        }
        
        </>
        }
        
        </>
    )
}

export default NftDetailForLevelUp