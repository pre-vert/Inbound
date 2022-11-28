// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "./Pool.sol";
import "./LongPool.sol";
import "./Computer.sol";
import "./Utils/Math.sol";

contract ShortPool is ERC20, IERC4626, ERC4626, Pool {

  using Math for uint256;

  string private constant NAME = "IBShareShort";
  string private constant SYMBOL = "IBSS";
  uint256 private constant INITIAL_SUPPLY = 0;
  address public longPoolAddress;
  address public computerAddress;
  address public immutable owner;
  uint scale = 10e8;

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
   * @notice (Re)sets the address of the long pool
   */
  function setLongPoolAddress(address _longPoolAddress)
    public onlyOwner {
      require(_longPoolAddress != address(0), "cannot be 0 address");
      longPoolAddress = _longPoolAddress;
  }

  /**
  * @notice (Re)sets the address of Computer
  */
  function setComputerAddress(address _computerAddress)
    public onlyOwner
  {
    require(_computerAddress != address(0), "cannot be 0 address");
    computerAddress = _computerAddress;
  }

  function betweenPoolTransfer(uint deposit_) private {
    LongPool longPool = LongPool(longPoolAddress);
    Computer computer = Computer(computerAddress);
    if (computer.shortPoolEquity() > totalAssets()) {
      uint transferShortToLong = ((scale - scale * totalAssets() / computer.shortPoolEquity()) * deposit_)/scale;
      require(transferShortToLong <= totalAssets(), "ShortPool: transfer more than total assets");
      transfer(longPoolAddress, transferShortToLong);
    }
    else if (computer.shortPoolEquity() < totalAssets()) {
      uint transferLongToShort = ((scale * totalAssets() / computer.shortPoolEquity() - scale) * deposit_)/scale;
      require(transferLongToShort <= longPool.totalAssets(), "ShortPool: cannot transfer more than shortpool total asset");
      //longPool.transfer(address(this), transferLongToShort);
    }
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
  }

  /**************************************************************** */
  //              Override ERC4626 logic
  /**************************************************************** */

  function _convertToShares(uint256 assets, Math.Rounding rounding)
    internal view override(ERC4626) returns (uint256 shares) {
    Computer computer = Computer(computerAddress);
    require(computer.allowDeposit(), "ShortPool: deposits unabled");
    uint256 supply = totalSupply();
    return
      (assets == 0 || supply == 0)
        ? _initialConvertToShares(assets, rounding)
        : assets.mulDiv(supply, computer.shortPoolEquity(), rounding);
  }
  
  function _convertToAssets(uint256 shares, Math.Rounding rounding)
    internal view override(ERC4626) returns (uint256 assets) {
    Computer computer = Computer(computerAddress);
    require(computer.allowShortPoolWithdrawal(), "ShortPool: withdrawals disabled");
    uint256 supply = totalSupply();
    return
      (supply == 0)
        ? _initialConvertToAssets(shares, rounding)
        : shares.mulDiv(computer.shortPoolEquity(), supply, rounding);
    }

  function _deposit(address caller, address receiver, uint256 assets, uint256 shares)
    internal override(ERC4626) {
    betweenPoolTransfer(assets);
    SafeERC20.safeTransferFrom(asset, caller, address(this), assets);
    _mint(receiver, shares);
    emit Deposit(caller, receiver, assets, shares);
    }
}