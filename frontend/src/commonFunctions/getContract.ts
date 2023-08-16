import { ethers } from 'ethers';

const getContract = (contractAddress: string, contractAbi: any): ethers.Contract => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);//フロントエンドからスマートコントラクトに接続できるようにするproviderというものを設定する
    const signer = provider.getSigner(); //MetaMaskの最初にアカウントアドレスを取得
    const dotCatNFTContract = new ethers.Contract(contractAddress, contractAbi, signer);

    return dotCatNFTContract;
}

export default getContract;