//SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "./ERC20.sol";
// import "./ERC4626.sol";
import "./LongPool.sol";
import "./ShortPool.sol";

contract Rebalancer {

  ERC20 public immutable asset;
  address public immutable owner;
  address public longPoolAddress;
  address public shortPoolAddress;
  uint256 public price = 1;

  constructor(ERC20 _asset) {
    asset = _asset;
    owner = msg.sender;
  }

  function assetAdress() public view  returns (address) {
      return address(asset);
  }

  function longPool() public view  returns (address) {
      return longPoolAddress;
  }

  function shortPool() public view  returns (address) {
      return shortPoolAddress;
  }

  function totalAssetsLong(LongPool _longPool) public view returns (uint256) {
    return _longPool.totalAssets();
  }

  function totalAssetsShort(ShortPool _shortPool) public view returns (uint256) {
    return _shortPool.totalAssets();
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

  /**
   * @notice Sets or resets the address of the long and short pools
   * @dev Only callable by the contract owner
   * @dev emits xxx when the addressses are successfuly changed (tbi)
   */
  function setPoolAddresses(address _longPoolAddress, address _shortPoolAddress)
    public onlyOwner {
      require(_longPoolAddress != address(0), "cannot be 0 address");
      require(_shortPoolAddress != address(0), "cannot be 0 address");
      // address oldLongPoolAddress = longPoolAddress;
      // address oldShortPoolAddress = shortPoolAddress;
      longPoolAddress = _longPoolAddress;
      shortPoolAddress = _shortPoolAddress;
      // emit setLongPoolAddresses(oldLongPoolAddress, _longPoolAddress);
      // emit setShortPoolAddresses(oldShortPoolAddress, _shortPoolAddress);
  }

  function rebalance(LongPool _longPool, uint256 amount) public {
    _longPool.transferAssetTo(shortPoolAddress, amount);
  }

}