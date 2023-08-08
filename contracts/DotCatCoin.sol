//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

/** 
 * @notice This Coin is minted and burned only from DotCatNFT Contract
 * @dev Owner should deploy this contract first, and owner should deploy DotCatNFT Contract second.
 * Owner of this Contract should execute setDotCatNFTAddress() right after deployment of this contract and DotCatNFT Contract.
 */ 
contract DotCatCoin is ERC20, Ownable {
    address private _dotCatNFTContractAddress;
    event Minted(address indexed account, uint256 indexed amount);

    constructor() ERC20("DotCatCoin", "DCC") {}
    
    modifier onlyFromDotCatNFTContract() {
        require(msg.sender == _dotCatNFTContractAddress, "DotCatCoin.sol: msg.sender in DotCatCoin Contract should be DotCatNFT Contract Address");
        _;
    }

    function setDotCatNFTAddress(address dotCatNFTContractAddress) external onlyOwner {
        _dotCatNFTContractAddress = dotCatNFTContractAddress;
    }

    function getDotCatNFTAddress() view public onlyOwner returns(address) {
        return _dotCatNFTContractAddress;
    }

    /**@dev
     * this function is for when contract owner's token is not enough.
     * about argument amount, if you want to mint x DCC, please set amount x * 10 ^ 18;
     */
    function mint(address sender, uint256 amount) external onlyFromDotCatNFTContract {
        _mint(sender, amount);

        //for Debug
        // console.log("from mint function");
        // console.log("msg.sender in CoinContract: %s", msg.sender);
        // console.log("sender: %s", sender);

        emit Minted(sender, amount);
    }

    function burn(address sender, uint256 amount) external onlyFromDotCatNFTContract {
        _burn(sender, amount);
    }
}