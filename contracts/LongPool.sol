// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "./ERC4626.sol";

contract LongPool is ERC4626 {

    string private constant NAME = "IBShareLong";
    string private constant SYMBOL = "IBSL";
    uint256 private constant INITIAL_SUPPLY = 0;
    IERC20 internal immutable _asset;                    // base token
    address internal immutable _rebalancer;

    /**
     * @dev sets ERC20 metadata of ERC4626
     */
    constructor(
        IERC20 asset_,                 // base token
        address rebalancer_ 
    )
    ERC20(NAME, SYMBOL, INITIAL_SUPPLY) ERC4626(asset_, rebalancer_)
    {   
         _asset = asset_;
         _rebalancer = rebalancer_;
    }

    
  
}