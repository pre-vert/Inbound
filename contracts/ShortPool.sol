// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "./ERC4626.sol";

/**
 * @dev 
 */

contract ShortPool is ERC4626 {

    string public constant NAME = "IBShareShort";
    string public constant SYMBOL = "IBSS";
    IERC20 private immutable _asset;                    // base token
    address private immutable _rebalancerAddress;

    /**
     * @dev sets ERC20 metadata of ERC4626
     */
    constructor(
        IERC20 asset_,                 // base token
        address rebalancerAddress_ 
    )
    ERC20(NAME, SYMBOL, 0)
    {   
        _asset = asset_;
        _rebalancerAddress = rebalancerAddress_;
    }
    
     // Modifier to check that the contract which calls reabalance() is Rebalancer
    modifier onlyRebalancer() {
        require(msg.sender == _rebalancerAddress, "Not rebalancer");
        _;
    }

    function transferAsset(address oppositePool, uint256 amount) public onlyRebalancer {
      require(oppositePool != address(0), "cannot be 0 address");
      require(amount <= totalAssets(), "cannot transfer more than total asset");
      _asset.transfer(oppositePool, amount);
      // emit setOppositePoolAddress(oldOppositePoolAddress, _oppositePoolAddress);
  }
  
}