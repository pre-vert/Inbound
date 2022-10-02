// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "./ERC4626.sol";

/**
 * @dev 
 */

contract Pool is ERC4626 {

    IERC20 private immutable _asset;                    // base token
    address private immutable _rebalancerAddress;

    /**
     * @dev Sets the underlying asset contract. This must be an ERC20-compatible contract (ERC20 or ERC777).
     */

    constructor(
        string memory name_,           // share token name
        string memory symbol_,         // share token symbol
        IERC20 asset_,                 // base token
        address rebalancerAddress_ 
    ) 
        ERC20(name_, symbol_, 0)    // sets ERC20 metadata of ERC4626
    {   
        _asset = asset_;
        _rebalancerAddress = rebalancerAddress_;
    }

    // Modifier to check that the contract which calls reabalance() is Rebalancer
    modifier onlyRebalancer() {
        require(msg.sender == _rebalancerAddress, "Not rebalancer");
        _;
    }

    // Rebalancing logic
    function transferAsset(address oppositePool, uint256 amount) public onlyRebalancer {
      require(oppositePool != address(0), "cannot be 0 address");
      require(amount <= totalAssets(), "cannot transfer more than total asset");
      _asset.transfer(oppositePool, amount);
      // emit setOppositePoolAddress(oldOppositePoolAddress, _oppositePoolAddress);
  }

}