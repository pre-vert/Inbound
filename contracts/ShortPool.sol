// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "./ERC4626.sol";
contract ShortPool is ERC4626 {

    string public constant NAME = "IBShareShort";
    string public constant SYMBOL = "IBSS";
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