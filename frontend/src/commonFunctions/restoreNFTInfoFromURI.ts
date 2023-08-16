const restoreNFTInfoFromUri = (uri: string) => {
    const encodedMetadata: string = uri.split(",")[1];
    const metadata: string = atob(encodedMetadata);//base64でデコード
  
    //ステータス取得
    const level: string = String(metadata.split(': ')[4].split('}')[0]);//レベルの取得
    const offensivePower: string = String(metadata.split(': ')[6].split('}')[0]);
    const physicalStrengh: string = String(metadata.split(': ')[8].split('}')[0]);
  
    //svg取得
    const imageUri: string = metadata.split(': ')[1].split('"')[1];
    const encodedSvg: string = imageUri.split(",")[1];
    const svg: string = atob(encodedSvg);//base64でデコード

    return [level, offensivePower, physicalStrengh, imageUri];
}

export default restoreNFTInfoFromUri;