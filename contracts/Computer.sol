//SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "./ERC20.sol";
import "./LongPool.sol";
import "./ShortPool.sol";
import "./Utils/Math.sol";

contract Computer {
  using Math for uint256;

  ERC20 public immutable _asset;
  address public _longPoolAddress;
  address public _shortPoolAddress;
  uint public immutable _forwardPrice;
  uint public immutable _delta;
  address public immutable _owner;
  uint public price = 120;
  uint scale = 10e8;

  constructor(
    ERC20 asset_,
    address longPoolAddress_,
    address shortPoolAddress_,
    uint forwardPrice_,
    uint delta_
    ) {
    _asset = asset_;
    _longPoolAddress = longPoolAddress_;
    _shortPoolAddress = shortPoolAddress_;
    _forwardPrice = forwardPrice_;
    _delta = delta_;
    _owner = msg.sender;
  }

  function assetAdress() public view  returns (address) {
    return address(_asset);
  }

  function shortPoolAddress() public view returns (address) {
    return _shortPoolAddress;
  }

  function longPoolAddress() public view returns (address) {
        return _longPoolAddress;
    }

  function forwardPrice() public view returns (uint256) {
    return _forwardPrice;
  }

  function delta() public view returns (uint256) {
    return _delta;
  }

  function getPrice() public view returns (uint256) {
    return price;
  }

  function setPrice(uint256 price_) public returns (uint256) {
    return price = price_;
  }

  modifier onlyOwner() {
    require(msg.sender == _owner, "Not owner");
    _;
  }

  function longSolvent() public view returns (int256) {
    uint256 ratio = price.mulDiv(scale,_forwardPrice);
    return int256(scale) + int256(_delta) * ( int256(ratio) - int256(scale) );
  }

  function shortSolvent() public view returns (int256) {
    uint256 ratio = price.mulDiv(scale,_forwardPrice);
    return int256(scale) - int256(_delta) * ( int256(ratio) - int256(scale) );
  }

  function longPoolEquity() public view returns (uint256) {
    LongPool longPool = LongPool(_longPoolAddress);
    ShortPool shortPool = ShortPool(_shortPoolAddress);
    uint ratio = price.mulDiv(_forwardPrice,1);
    uint minCollateral = Math.min(longPool.totalAssets(),shortPool.totalAssets());
    return Math.max(longPool.totalAssets() + _delta * (ratio-1) * minCollateral, 0);
  }

  function shortPoolEquity() public view returns (uint256) {
    LongPool longPool = LongPool(_longPoolAddress);
    ShortPool shortPool = ShortPool(_shortPoolAddress);
    uint ratio = price.mulDiv(_forwardPrice,1);
    uint minCollateral = Math.min(longPool.totalAssets(),shortPool.totalAssets());
    return Math.max(shortPool.totalAssets() - _delta * (ratio-1) * minCollateral, 0);
  }

  function allowDeposit() public view returns (bool allow) {
    LongPool longPool = LongPool(_longPoolAddress);
    ShortPool shortPool = ShortPool(_shortPoolAddress);
    if
    (
      (
        longPool.totalAssets()>0 &&
        shortPool.totalAssets()>0 && 
        longPoolEquity()>0 && 
        shortPoolEquity()>0
      )
      ||
      (
        (
          longPool.totalAssets()==0 ||
          shortPool.totalAssets()==0
        )
        &&
        (
          longSolvent()>0 && 
          shortSolvent()>0
        )
      )
    )
    {
      return true;
    }
    else 
    {
      return false;
    }
  }



  // function longPoolClaim() internal view returns (uint) {
  //   uint longPoolCollateral = longPool.totalAssets();
  //   return longPoolCollateral + delta * minCollateral() * ((price/forwardPrice) - 1);
  // }

  // function shortPoolClaim() internal view returns (uint) {
  //   uint shortPoolCollateral = shortPool.totalAssets();
  //   return shortPoolCollateral - delta * minCollateral() * ((price/forwardPrice) - 1);
  // }

} 