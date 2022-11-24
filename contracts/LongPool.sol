// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "./Pool.sol";
import "./ShortPool.sol";
import "./Computer.sol";
import "./Utils/Math.sol";

contract LongPool is ERC20, IERC4626, ERC4626, Pool {
  using Math for uint256;

    string private constant NAME = "IBShareLong";
    string private constant SYMBOL = "IBSL";
    uint256 private constant INITIAL_SUPPLY = 0;
    // ERC20 internal immutable asset;   
    address public shortPoolAddress;
    address public computerAddress;
    ShortPool public shortPool = ShortPool(shortPoolAddress);
    // Computer public computer = Computer(computerAddress);
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

  function AssetAdress() public view  returns (address) {
    return address(asset);
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

/**************************************************************** */
//              Override ERC4626/Vault logic
/**************************************************************** */

function _convertToShares(uint256 assets, Math.Rounding rounding)
  internal view override(ERC4626) returns (uint256 shares) {
  Computer computer = Computer(computerAddress);
  require(computer.allowDeposit(), "LongPool: deposits unabled");
  uint256 supply = totalSupply();
  return
    (assets == 0 || supply == 0)
      ? _initialConvertToShares(assets, rounding)
      : assets.mulDiv(supply, computer.longPoolEquity(), rounding);
}

// function previewDeposit(uint256 assets) public view override(IERC4626,ERC4626) returns (uint256) {
//     return _convertToShares(assets, Math.Rounding.Down);
// }

// function deposit(uint256 assets, address receiver) public override(IERC4626,ERC4626) returns (uint256) {
//     require(assets <= maxDeposit(receiver), "ERC4626: deposit more than max");
//     require(assets > 0, "ERC4626: Deposit less than Zero");
//     uint256 shares = previewDeposit(assets);
//     _deposit(_msgSender(), receiver, assets, shares);
//     // the one who deposits, the one who receives shares, value deposited, shares received
//     return shares;
// }

}