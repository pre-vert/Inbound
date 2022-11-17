// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "./Pool.sol";
import "./LongPool.sol";
import "./Computer.sol";

contract ShortPool is ERC4626, Pool {

    string private constant NAME = "IBShareShort";
    string private constant SYMBOL = "IBSS";
    uint256 private constant INITIAL_SUPPLY = 0;
    // ERC20 internal immutable asset;
    address public longPoolAddress;
    address public computerAddress;
    LongPool public longPool = LongPool(longPoolAddress);
    Computer public computer = Computer(computerAddress);
    address public immutable owner;

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
   * @notice (Re)sets the address of the long pool
   */
  function setLongPoolAddress(address _poolAddress)
    public onlyOwner {
        require(_poolAddress != address(0), "cannot be 0 address");
        longPoolAddress = _poolAddress;
  }

  /**
  * @notice (Re)sets the address of the computer
  */
  function setComputerAddress(address _computerAddress)
    public onlyOwner {
      require(_computerAddress != address(0), "cannot be 0 address");
      computerAddress = _computerAddress;
  }

  // function transferToLongPool(uint amount) private {
  //   require(longPoolAddress != address(0), "cannot be 0 address");
  //   require(amount <= totalAssets(), "cannot transfer more than total asset");
  //   transfer(longPoolAddress, amount);
  // }

  function transferFromLongPool(uint amount) private {
    require(amount <= longPool.totalAssets(), "cannot transfer more than total asset");
    longPool.transfer(address(this), amount);
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
  }
  
}