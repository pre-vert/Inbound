//SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "./ERC4626.sol";
import "./LongPool.sol";
import "./ShortPool.sol";

contract Rebalancer {

  ERC20 public immutable asset;
  address public longPoolAddress;
  address public shortPoolAddress;
  address public immutable owner;

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

  modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
  }

  /**
   * @notice Sets or resets the address of the long and short pools
   * @dev Only callable by the contract owner (onlyOwner to be implemented)
   * @dev emits xxx when the addressses are successfuly changed (tbi)
   */
  function setPoolAddresses(
    address _longPoolAddress,
    address _shortPoolAddress
    ) public onlyOwner {
      require(_longPoolAddress != address(0), "cannot be 0 address");
      require(_shortPoolAddress != address(0), "cannot be 0 address");
      // address oldLongPoolAddress = longPoolAddress;
      // address oldShortPoolAddress = shortPoolAddress;
      longPoolAddress = _longPoolAddress;
      shortPoolAddress = _shortPoolAddress;
      // emit setLongPoolAddresses(oldLongPoolAddress, _longPoolAddress);
      // emit setShortPoolAddresses(oldShortPoolAddress, _shortPoolAddress);
  }

  // essai transfer long vers short
  function rebalance(LongPool _longPool) public {
    _longPool.transferAsset(shortPoolAddress, 10);
  }

}