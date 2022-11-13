// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "./ERC4626.sol";
import "./ShortPool.sol";

contract LongPool is ERC4626 {

    string private constant NAME = "IBShareLong";
    string private constant SYMBOL = "IBSL";
    uint256 private constant INITIAL_SUPPLY = 0;
    // ERC20 internal immutable asset;
    address public immutable owner;    
    address public shortPoolAddress;

    /**
     * @dev sets ERC20 metadata of ERC4626
     */
    constructor(
        ERC20 asset_                 // base token
    )
    ERC20(NAME, SYMBOL, INITIAL_SUPPLY) ERC4626(asset_)
    {   
        asset = asset_;
        owner = msg.sender;
    }

    /**
     * @dev Returns opposite pool address.
     */
    function getShortPoolAddress() public view returns (address) {
        return shortPoolAddress;
    }

    /**
   * @notice Sets or resets the address of the long and short pools
   * @dev Only callable by contract owner
   * @dev emits xxx when the addressses are successfuly changed (tbi)
   */
  function recordShortPoolAddress(address _shortPoolAddress)
    public onlyOwner {
        require(_shortPoolAddress != address(0), "cannot be 0 address");
        // address oldShortPoolAddress = shortPoolAddress;
        shortPoolAddress = _shortPoolAddress;
        // emit setShortPoolAddresses(oldShortPoolAddress, _shortPoolAddress);
  }

  function transferToShortPool(uint amount) private {
    require(shortPoolAddress != address(0), "cannot be 0 address");
    require(amount <= totalAssets(), "cannot transfer more than total asset");
    transfer(shortPoolAddress, amount);
  }

  function transferFromShortPool(uint amount) private {
    ShortPool shortPool = ShortPool(shortPoolAddress);
    require(amount <= shortPool.totalAssets(), "cannot transfer more than total asset");
    shortPool.transfer(address(this), amount);
    //emit setOppositePoolAddress(oldOppositePoolAddress, _oppositePoolAddress);
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
  }
  
}