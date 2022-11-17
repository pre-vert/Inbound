// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "./Pool.sol";
import "./ShortPool.sol";
import "./Computer.sol";

contract LongPool is ERC20, IERC4626, ERC4626, Pool {

    string private constant NAME = "IBShareLong";
    string private constant SYMBOL = "IBSL";
    uint256 private constant INITIAL_SUPPLY = 0;
    // ERC20 internal immutable asset;   
    address public shortPoolAddress;
    address public computerAddress;
    ShortPool public shortPool = ShortPool(shortPoolAddress);
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
   * @notice (Re)sets the address of the short pool
   */
  function setShortPoolAddress(address _shortPoolAddress)
    public onlyOwner {
      require(_shortPoolAddress != address(0), "cannot be 0 address");
      shortPoolAddress = _shortPoolAddress;
  }

   /**
   * @notice (Re)sets the address of the computer
   */
  function setComputerAddress(address _computerAddress)
    public onlyOwner {
      require(_computerAddress != address(0), "cannot be 0 address");
      computerAddress = _computerAddress;
  }

  // function transferToShortPool(uint amount) private {
  //   require(shortPoolAddress != address(0), "cannot be 0 address");
  //   require(amount <= totalAssets(), "cannot transfer more than total asset");
  //   transfer(shortPoolAddress, amount);
  // }

  function transferFromShortPool(uint amount) private {
    require(amount <= shortPool.totalAssets(), "cannot transfer more than total asset");
    shortPool.transfer(address(this), amount);
    // emit setOppositePoolAddress(oldOppositePoolAddress, _oppositePoolAddress);
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
  }
  
}