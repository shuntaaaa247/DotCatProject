import Link from "next/link"
import Image from "next/image"
// import { ReactComponent as Logo }  from"../../public/dotcat.svg";

type Props = {
    connectWallet: () => void,
    ifWalletConnectiong: boolean,
    dccAmount: number
    currentPage: string
}

const Header = ({connectWallet, ifWalletConnectiong, dccAmount, currentPage}: Props) => {
    return(
    <header className='bg-blue-400 '>
      <nav className='flex justify-between'>
        <div className='flex flex-row'>
        <Link href="./"><p className="p-5 my-auto font-bold text-2xl text-white ">Dot Cat <span className='text-red-500'>NFT</span> Battle</p></Link>
        <Link href="./"><Image src="/dotcat.svg" alt="DotCat Logo" className="py-1" width={70} height={50}/></Link>
        </div>
        <div className='flex flex-row items-center'>
        {currentPage === "home" ? <Link href="./"><p className="mx-5 text-xl text-white my-auto underline">ホーム</p></Link> : <Link href="./"><p className="mx-5 text-xl text-white my-auto">ホーム</p></Link>}
        {currentPage === "battle" ? <Link href="/battle"><p className="mx-5 text-xl text-white my-auto underline">バトル</p></Link> : <Link href="/battle"><p className="mx-5 text-xl text-white my-auto">バトル</p></Link>}
        {currentPage === "collection" ? <Link href="/collection"><p className="mx-5 text-xl text-white my-auto underline">コレクション</p></Link> : <Link href="/collection"><p className="mx-5 text-xl text-white my-auto">コレクション</p></Link>}
        
        {ifWalletConnectiong ? 
            <p className="px-3 py-2 mx-7 my-auto bg-white text-black font-semibold rounded" >DCC : {dccAmount}（×10<sup>-18</sup>）</p> :
            <p></p>
        }
        <p className="text-xl my-auto">{ifWalletConnectiong ? "🔵" : "🔴"}</p>
        <button onClick={connectWallet} className="px-5 py-2 mx-7 my-2 bg-indigo-600 text-xl text-white font-semibold rounded hover:bg-indigo-700">Connect Wallet (Mumbai)</button>
        </div>
      </nav>
    </header>
    )
}

export default Header