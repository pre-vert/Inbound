//SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "./ERC20.sol";
import "./LongPool.sol";
import "./ShortPool.sol";

contract Computer {

  ERC20 private immutable asset;
  address public immutable owner;
  address public longPoolAddress;
  address public shortPoolAddress;
  ShortPool private shortPool = ShortPool(shortPoolAddress);
  LongPool private longPool = LongPool(longPoolAddress);
  uint256 public price = 1;

  constructor(
    ERC20 _asset,
    address _longPoolAddress,
    address _shortPoolAddress
    ) {
    asset = _asset;
    longPoolAddress = _longPoolAddress;
    shortPoolAddress = _shortPoolAddress;
    owner = msg.sender;
  }

  function AssetAdress() public view  returns (address) {
    return address(asset);
  }

  function ShortPoolAddress() public view returns (address) {
    return shortPoolAddress;
  }

  function LongPoolAddress() public view returns (address) {
        return longPoolAddress;
    }

  function totalAssetsLong() public view returns (uint256) {
    return longPool.totalAssets();
  }

    function totalAssetsShort() public view returns (uint256) {
    return shortPool.totalAssets();
  }

  function getPrice() public view returns (uint256) {
    return price;
  }

  function setPrice(uint256 _price) public returns (uint256) {
    return price = _price;
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
  }

} 