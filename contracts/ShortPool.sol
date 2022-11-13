// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "./ERC4626.sol";
import "./LongPool.sol";

contract ShortPool is ERC4626 {

    string private constant NAME = "IBShareShort";
    string private constant SYMBOL = "IBSS";
    uint256 private constant INITIAL_SUPPLY = 0;
    // ERC20 internal immutable asset;
    address public immutable owner;
    address public longPoolAddress;

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
    function getLongPoolAddress() public view returns (address) {
        return longPoolAddress;
    }

    /**
   * @notice Sets or resets the address of the long and short pools
   * @dev Only callable by contract owner
   * @dev emits xxx when the addressses are successfuly changed (tbi)
   */
  function recordLongPoolAddress(address _longPoolAddress)
    public onlyOwner {
        require(_longPoolAddress != address(0), "cannot be 0 address");
        // address oldLongPoolAddress = longPoolAddress;
        longPoolAddress = _longPoolAddress;
        // emit setLongPoolAddresses(oldLongPoolAddress, _longPoolAddress);
  }

  function transferToLongPool(uint amount) private {
    require(longPoolAddress != address(0), "cannot be 0 address");
    require(amount <= totalAssets(), "cannot transfer more than total asset");
    transfer(longPoolAddress, amount);
  }

  function transferFromLongPool(uint amount) private {
    LongPool longPool = LongPool(longPoolAddress);
    require(amount <= longPool.totalAssets(), "cannot transfer more than total asset");
    longPool.transfer(address(this), amount);
    //emit setOppositePoolAddress(oldOppositePoolAddress, _oppositePoolAddress);
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
  }
  
}