import { CSSProperties, use, useEffect, useState } from "react"
import Image from "next/image";
import CoinFaucet from "./coinFaucet";


type Props = {
    status: number[]
    imageUri: string
    closeBattle: () => void
}

// const colorArray: string[] = ["red", "blue", "yellow", "green", "gold", "black", "gray", "brawn", "purple"];
// let randomIndexArray: number[];

const BattleScene = ({status, imageUri, closeBattle}: Props) => {
    const [currentStatus, setCurrentStatus] = useState<number[]>([]); //味方のステータス　0:tokenId 1:レベル, 2:攻撃力, 3:体力
    const [enemyCurrentStatus, setEnemyCurrentStatus] = useState<number[]>([]); //敵のステータス　0:レベル, 1:攻撃力 , 2:体力
    const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
    const [message, setMessage] = useState<string>("");
    const [winner, setWinner] = useState<string>(""); //PlayerかEnemyの文字列が入ったときに結果がモーダルで出力される

    //初回レンダリングでステータス入力
    useEffect(()=> {
        setCurrentStatus(status);
        getEnemyStatus();
    }, []);

    useEffect(()=> {
        checkWinner();
    }, [message]);

    const getEnemyStatus = () => {
        //敵のステータス
        let level:number = 1;
        let offensivePower: number = 1;
        let physicalStrengh: number = 10;

        for (let i = 1; i < status[1]; i ++) {
            console.log("敵のレベルアップ！！！")
            level ++
            offensivePower += Math.floor(Math.random() * 3 + 1);
            physicalStrengh += Math.floor(Math.random() * 3 + 1);
        }
        console.log(`味方のレベル：${status[1]}`)
        console.log(`敵のレベル：${level}`)
        setEnemyCurrentStatus([level, offensivePower, physicalStrengh]);
    }

    const attack = () => {
        if(Math.random() >= 0.3) {
            //以下は攻撃が命中した場合
            if(Math.random() >= 0.7) {
                //クリティカル攻撃の場合、体力を相手の攻撃力分+5減らす
                isPlayerTurn ? 
                setEnemyCurrentStatus([enemyCurrentStatus[0], enemyCurrentStatus[1], enemyCurrentStatus[2]-currentStatus[2]-5]) : 
                setCurrentStatus([currentStatus[0], currentStatus[1], currentStatus[2], currentStatus[3]-enemyCurrentStatus[1]-5])

                isPlayerTurn ? setMessage(`Your NFT : 敵に${currentStatus[2]+5}ダメージ(クリティカル)を与えた！\n` + message) : setMessage(`Enemy : あなたのNFTに${enemyCurrentStatus[1]+5}ダメージ(クリティカル)を与えた！\n` + message);
            } else {
                //通常攻撃の場合、体力を相手の攻撃力分減らす
                isPlayerTurn ? 
                setEnemyCurrentStatus([enemyCurrentStatus[0], enemyCurrentStatus[1], enemyCurrentStatus[2]-currentStatus[2]]) : 
                setCurrentStatus([currentStatus[0], currentStatus[1], currentStatus[2], currentStatus[3]-enemyCurrentStatus[1]])

                isPlayerTurn ? setMessage(`Your NFT : 敵に${currentStatus[2]}ダメージを与えた！\n` + message) : setMessage(`Enemy : あなたのNFTに${enemyCurrentStatus[1]}ダメージを与えた！\n` + message);
            }
        } else {
            //攻撃が命中しなかった場合
            isPlayerTurn ? setMessage("Your NFT : 攻撃が当たらなかった！\n" + message) : setMessage("Enemy : 攻撃が当たらなかった！\n" + message)
        }
        //ターンチェンジ
        setIsPlayerTurn(!(isPlayerTurn));
    }

    const checkWinner = () => {
        if (enemyCurrentStatus[2] <= 0) {
            setWinner("Player");
        }
        if (currentStatus[3] <= 0) {
            setWinner("Enemy")
        }
    }


    const log = () => {
        return (
            <div className="bg-gray-200 px-10 py-3 rounded mt-5 items-center">
                <p>ログ</p>
                {message.split("\n").map(log => (
                    <p className="underline decoration-slate-500 py-1">{log}</p>
                ))}
            </div>
        )
    }

    //モーダルウィンドウ用css
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
        <>
        {/* {isPlayerTurn ? <p>あなたのターン</p> : <p>敵のターン</p>} */}
        <div className="w-screen flex justify-center items-center">
            <div className="flex flex-col items-center">
                {isPlayerTurn ? <p className="text-4xl font-semibold mt-7 mb-3">あなたのターン</p> : <p className="text-4xl font-semibold mt-7 mb-3">敵のターン</p>}
                <div className='flex flex-row'>
                    <div className="flex flex-col items-center mx-100">
                        <p className="text-xl font-bold">Enemy</p>
                        <Image src="/enemy.svg" alt="Enemy" className="py-1" width={320} height={320}/>
                        <p>レベル：{enemyCurrentStatus[0]}</p>
                        <p>攻撃力：{enemyCurrentStatus[1]}</p>
                        <p>体力：{enemyCurrentStatus[2]}</p>
                    </div>
                    <div className="flex items-center"><p className="text-5xl font-bold mx-20">vs</p></div>
                    <div className="flex flex-col items-center">
                        <p className="text-xl font-bold">Your NFT</p>
                        <img src={imageUri}/>
                        <p>レベル：{currentStatus[1]}</p>
                        <p>攻撃力：{currentStatus[2]}</p>
                        <p>体力：{currentStatus[3]}</p>
                    </div>
                </div>
                {isPlayerTurn ? 
                <button onClick={() => attack()} className="px-5 py-2 mx-7 my-2 bg-red-600 text-xl text-white font-semibold rounded hover:bg-red-700">攻撃</button> :
                <button onClick={() => attack()} className="px-5 py-2 mx-7 my-2 bg-red-500 text-xl text-white font-semibold rounded hover:bg-red-700">攻撃を受ける</button>}
                {log()}
            </div>
            {winner === "Player" || winner === "Enemy" ? 
            <div style={overlay}>
                <div style={modalContent}>
                    <div className="flex flex-col items-center">
                        <button onClick={() => closeBattle()} className="text-3xl mr-auto ml-2">×</button>
                        {winner === "Player" ? 
                        <><p className="text-4xl font-semibold">You Win!!!</p> <CoinFaucet /></> : 
                        <>
                            <p className="text-4xl font-semibold">You Lose...</p>
                            <p className="text-2xl font-semibold m-10">バトルに勝ってDCCを受け取ろう！</p>
                        </>}
                    </div>
                </div>
            </div>
            : <p></p>}

        </div>
        </>
    )
}

export default BattleScene;