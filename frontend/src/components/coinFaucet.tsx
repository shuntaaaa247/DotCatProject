import getContract from "../commonFunctions/getContract";
import DotCatNFT from "../../contracts/DotCatNFT.json";
import { CircularProgress } from '@mui/material';
import { useState } from "react";
import { BlobOptions } from "buffer";

const dotCatCoinAddress: string = "0x0d9F650cDe2D6A8e04B9E7C4Badd9d90B39Ae6c0";
const dotCatNFTAddress:string = "0xcEB79808A09c1a0FAB3d579a678B9073745DEAB1";
const mumbaiChainId: string = "0x13881";
const zeroAddress = "0x0000000000000000000000000000000000000000";

const CoinFaucet = () => {
    const [isLoading, setIsLoading] = useState<Boolean>(false);
    const [isMinted, setisMinted] = useState<boolean>(false);

    const mintCoin = async () => {
        try {
            setIsLoading(true);
            const dotCatNFTContract = getContract(dotCatNFTAddress, DotCatNFT.abi);
            const tx = await dotCatNFTContract.mintDCCFromDCAT(5);
            await tx.wait();
            setisMinted(true);
            setIsLoading(false);
        } catch(error) {
            alert("エラーが発生しました");
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return(
            <>
                <p className="mx-80 my-20"><CircularProgress /></p>
            </>
        )
    } else {
        if (isMinted) {
            return(
                <>
                <p className="text-3xl my-10 px-10">DCCを受け取りました！</p>
                </>
            )

        } else {
            return(
                <>
                    <p className="text-3xl mt-16 mb-3 px-10">報酬としてDCCを受け取ることができます！</p>
                    <p className="text-0.5xl mb-3">DCCを使うことで新規NFTを発行したり、<br/>NFTをレベルアップすることができます。</p>
                    <button onClick={mintCoin} className="px-5 py-2 mx-7 mt-5 bg-indigo-600 text-xl text-white font-semibold rounded hover:bg-indigo-700">5（×10<sup>-18</sup>）DCCを受け取る</button>
                    <p className="mt-5 mb-10">※あとから受け取ることはできません</p>
                </>
            )
        }
    }
}

export default CoinFaucet
