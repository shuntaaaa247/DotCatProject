import getContract from "../commonFunctions/getContract";
import DotCatNFT from "../../contracts/DotCatNFT.json";
import { CSSProperties, useEffect, useState } from "react";
import restoreNFTInfoFromUri from "../commonFunctions/restoreNFTInfoFromURI"
import { CircularProgress } from '@mui/material';
import NftDetailForLevelUp from "./nftDetailForLevelUp";

const dotCatCoinAddress: string = "0x0d9F650cDe2D6A8e04B9E7C4Badd9d90B39Ae6c0";
const dotCatNFTAddress:string = "0xcEB79808A09c1a0FAB3d579a678B9073745DEAB1";
const mumbaiChainId: string = "0x13881";
const zeroAddress = "0x0000000000000000000000000000000000000000";

type Props = {
    from: string,
    account: string,
    setFightingNFTId: (tokenId: number) => void, //バトル用
    setFightingNFTUri: (uri: string) => void, //バトル用
    closeModal: () => void //バトル用
    getDCCAmount: () => void //レベルアップ後にDCC残高の表示を更新するため
}

//このコンポーネントはバトルページとコレクションページから呼び出される（fromでどちらが親コンポーネントかを識別し条件分岐する）

const NftCollection = ({from, account, setFightingNFTId, setFightingNFTUri, closeModal, getDCCAmount}: Props) => {
    const [ownedNFTArray, setOwnedNFTArray] = useState<number[]>([]);//バトルとレベルアップ共用
    const [ownedNFTUriArray, setOwnedNFTUriArray] = useState<string[]>([]);//バトルとレベルアップ共用
    const [isLoading, setIsLoading] = useState<boolean>(false);//バトルとレベルアップ共用
    const [ModalIsOpenForLevelUp, setModalIsOpenForLevelUp] = useState<Boolean>(false)//collectionページからのNFTレベルアップモーダル
    const [targetTokenIdForLevelUp, setTargetTokenIdForLevelUp] = useState<number>(NaN);

    useEffect(() => {
        getOwnedNFTs()
    },[])

    const getOwnedNFTs = async () => {
        try {
            setIsLoading(true);
            const dotCatNFTContract = getContract(dotCatNFTAddress, DotCatNFT.abi);
            const filter = dotCatNFTContract.filters.Transfer(null, account, null);//条件の設定
            const transferToAccountLogs = await dotCatNFTContract.queryFilter(filter);//過去のイベントから条件に合うものを検索し取得、オブジェクト型

            let ownedTokenArray: number[] =[];
            let ownedTokenUriArray: string[] =[];
            for (const log of transferToAccountLogs) {
                if (log.args) {
                    const {from, to, tokenId} = log.args;
                    if (account === String(to).toLowerCase()) { //イーサリアムのアドレスでは大文字と小文字を区別しない。accountは小文字で定義されているため、toを小文字に変換する。
                        ownedTokenArray.push(Number(tokenId));
                        ownedTokenUriArray.push(await dotCatNFTContract.tokenURI(Number(tokenId)));
                    }
                }
            }

            setOwnedNFTArray(ownedTokenArray);
            setOwnedNFTUriArray(ownedTokenUriArray);
            setIsLoading(false);
        } catch {
            setIsLoading(false);
            alert("エラー")
        }
        

    }

    const chooseNFT = (tokenId: number, index: number) => {
        if (from === "battle") {
            setFightingNFTId(tokenId);
            setFightingNFTUri(ownedNFTUriArray[index]);
            closeModal();
        } else {//レベルアップ用(fromコレクションページ)
            setTargetTokenIdForLevelUp(tokenId);//レベルアップするtokenのIDをセット
            setModalIsOpenForLevelUp(true);
        }
        
    }

    const collection = ownedNFTArray.map((tokenId, index)=>//第二引数を設定することでインデックスを使える fromバトルページfromコレクションページ共用
        <li key={String(ownedNFTArray[index])}>
            <div className="justify-center items-center p-6 w-40 mx-2 my-5 bg-slate-100 rounded-md hover:bg-slate-300">
            <button onClick={() => chooseNFT(tokenId, index)}>
            <p>TokenID: {tokenId}</p>
            <img src={restoreNFTInfoFromUri(ownedNFTUriArray[index])[3]}  />
            <p className="mx-auto">レベル：{restoreNFTInfoFromUri(ownedNFTUriArray[index])[0]}</p>
            <p>攻撃力：{restoreNFTInfoFromUri(ownedNFTUriArray[index])[1]}</p>
            <p>体力：{restoreNFTInfoFromUri(ownedNFTUriArray[index])[2]}</p>
            </button>
            </div>
        </li>
    );

    const closeModalForNFTLevelUp = () => {
        setModalIsOpenForLevelUp(false);
        setTargetTokenIdForLevelUp(NaN);
    }

    //レベルアップモーダルウィンドウ用css
    const modalContent: CSSProperties = {
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

    return(
        <div className="flex flex-col justify-center items-center">
        {from === "battle" ? <><button className="ml-3 text-5xl mr-auto" onClick={closeModal}>×</button>
        <h1 className="text-3xl mb-10">バトルで使用するNFTを選択してください</h1></> : <p></p>}
        {isLoading ? 
            <p className="my-10"><CircularProgress /></p> : 
            <ul className="flex flex-wrap">{collection}</ul>
        }
        {from === "collection" && ModalIsOpenForLevelUp ? 
        <div style={overlay}>
            <div style={modalContent}>
                <div className="flex flex-col justify-center items-center">
                    <NftDetailForLevelUp account={account} tokenId={targetTokenIdForLevelUp} closeModalForNFLevelUp={closeModalForNFTLevelUp} getDCCAmount={getDCCAmount}/>
                </div>
            </div>
        </div> :<p></p> }
        </div>
    )

    
}

export default NftCollection;