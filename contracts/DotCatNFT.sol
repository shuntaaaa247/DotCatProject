//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "hardhat/console.sol";


interface DotCatCoin {
    function balanceOf(address account) external view returns (uint256);
    function burn(address sender, uint256 amount) external;
    function mint(address sender, uint256 amount) external;
}

contract DotCatNFT is ERC721URIStorage {

    DotCatCoin private dotCatCoin;

    using Counters for Counters.Counter;
    using Strings for uint256;
    Counters.Counter private _lastTokenId;
    string[] private colors = ["red", "orange", "gold", "brown", "blue", "purple", "green", "gray", "black"];
    struct CatStatus {
        uint256 tokenId;
        uint256 level;
        uint256 offensivePower;
        uint256 physicalStrength;
        uint256[5] colorIndexes;
    }
    mapping(uint256 => CatStatus) public idToCatStatus;

    constructor(address dotCatCoinAddress) ERC721("DotCatNFT", "DCAT"){
        dotCatCoin = DotCatCoin(dotCatCoinAddress);
    }

    function mint() public {
        _lastTokenId.increment();
        uint256 tokenId = _lastTokenId.current();
        _safeMint(msg.sender, tokenId);
        idToCatStatus[tokenId] = CatStatus(tokenId, 1, 1, 10, _getColorIndexes(tokenId));
        bytes memory encodedSvg = _createSvg(tokenId);
        bytes memory metadata = _createMetadata(encodedSvg, tokenId);
        string memory uri = string(abi.encodePacked("data:application/json;base64,", Base64.encode(metadata)));
        _setTokenURI(tokenId, uri);

        if (balanceOf(msg.sender) > 1) {
            dotCatCoin.burn(msg.sender, 30); //初回ミント時以外は、30 * 10^-18トークンをバーンする必要がある。
        }
    }

    function _getColorIndexes(uint256 tokenId) view private returns(uint256[5] memory) {
        uint256[5] memory colorIndexes;
        for (uint256 i = 0; i < colorIndexes.length; i++) {
            colorIndexes[i] = uint256(keccak256(abi.encodePacked(tokenId + i, block.timestamp))) % (colors.length);
        }
        return colorIndexes;
    }

    function _createSvg(uint256 tokenId) view private returns (bytes memory) {
        return (abi.encodePacked("<svg width='320' height='320' xmlns='http://www.w3.org/2000/svg'><polygon style='fill:", colors[idToCatStatus[tokenId].colorIndexes[0]], 
        "' points='20, 80 40, 80 40, 40 60, 40 60, 20 80, 20 80, 40 100, 40 100, 60 200, 60 200, 40 220, 40 220, 20 240, 20 240, 40 260, 40 260, 80 280, 80 280, 180 260, 180 260, 200 220, 200 220, 220 200, 220 200, 240 240, 240 240, 260 260, 260 260, 240 280, 240 280, 220 300, 220 300, 260 280, 260 280, 280 240, 280 240, 300 80, 300 80, 280 100, 280 100, 220 80, 220 80, 200 40, 200 40, 180 20, 180'/><polygon style='fill:white",  
        "' points='40, 100 60, 100 60, 80 120, 80 120, 160 40, 160'/><polygon style='fill:", colors[idToCatStatus[tokenId].colorIndexes[1]], 
        "' points='60, 100 80, 100 80, 140 60, 140'/><polygon style='fill:white", 
        "' points='160, 100 180, 100 180, 80 240, 80 240, 160 160, 160'/><polygon style='fill:", colors[idToCatStatus[tokenId].colorIndexes[2]],
        "' points='180, 100 200, 100 200, 140 180, 140'/><polygon style='fill:", colors[idToCatStatus[tokenId].colorIndexes[3]],
        "' points='100, 220 200, 220 200, 240 100, 240'/><polygon style='fill:", colors[idToCatStatus[tokenId].colorIndexes[4]],
        "' points='120, 220, 140, 220 140, 240 120, 240'/></svg>"));
    }

    function _createMetadata(bytes memory catSvg, uint256 tokenId) private view returns(bytes memory) {
        return(
            abi.encodePacked(
                '{"image": "data:image/svg+xml;base64,', Base64.encode(catSvg), '", ',
                '"attributes": [{"level": "', Strings.toString(idToCatStatus[tokenId].level), '", "offensive power": "', Strings.toString(idToCatStatus[tokenId].offensivePower), '", ',
                '"Physical Strength": "', Strings.toString(idToCatStatus[tokenId].physicalStrength), '",}]}'
            )
        );
    }

    //ゲームの報酬としてミントできる。
    function mintDCCFromDCAT(uint256 amount) external {
        dotCatCoin.mint(msg.sender, amount);
    }

    // 未完成
    function levelUp(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender);

        idToCatStatus[tokenId].level += 1;
        idToCatStatus[tokenId].offensivePower += (uint256(keccak256(abi.encodePacked(tokenId, block.timestamp))) % 3 + 1); //攻撃力は1~3の間でランダムに増加する。
        idToCatStatus[tokenId].physicalStrength += (uint256(keccak256(abi.encodePacked(tokenId + tokenId, block.timestamp))) % 3 + 1); //攻撃力は1~3の間でランダムに増加する。

        bytes memory encodedSvg = _createSvg(tokenId);
        bytes memory metadata = _createMetadata(encodedSvg, tokenId);
        string memory uri = string(abi.encodePacked("data:application/json;base64,", Base64.encode(metadata)));
        _setTokenURI(tokenId, uri);
        dotCatCoin.burn(msg.sender, 1+idToCatStatus[tokenId].level);
    }
}
