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
    address public shortPoolAddress;
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
   * @notice (Re)sets the address of the short pool
   */
  function setShortPoolAddress(address _shortPoolAddress)
    public onlyOwner {
      require(_shortPoolAddress != address(0), "cannot be 0 address");
      shortPoolAddress = _shortPoolAddress;
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
    ShortPool shortPool = ShortPool(shortPoolAddress);
    Computer computer = Computer(computerAddress);
    if (computer.longPoolEquity() > totalAssets()) {
      uint transferLongToShort = ((scale - scale * totalAssets() / computer.longPoolEquity()) * deposit_)/scale;
      require(transferLongToShort <= totalAssets(), "LongPool: transfer more than total assets");
      transfer(shortPoolAddress, transferLongToShort);
    }
    else if (computer.longPoolEquity() < totalAssets()) {
      uint transferShortToLong = ((scale * totalAssets() / computer.longPoolEquity() - scale) * deposit_)/scale;
      require(transferShortToLong <= shortPool.totalAssets(), "LongPool: cannot transfer more than shortpool total asset");
      shortPool.transfer(address(this), transferShortToLong);
    }
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
  }

  /**************************************************************** */
  //              Override ERC4626 logic
  /**************************************************************** */

  function _deposit(address caller, address receiver, uint256 assets, uint256 shares)
    internal override(ERC4626) {
    betweenPoolTransfer(assets);
    SafeERC20.safeTransferFrom(asset, caller, address(this), assets);
    _mint(receiver, shares);
    emit Deposit(caller, receiver, assets, shares);
    }
    
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

  function _convertToAssets(uint256 shares, Math.Rounding rounding)
    internal view override(ERC4626) returns (uint256 assets) {
    Computer computer = Computer(computerAddress);
    require(computer.allowLongPoolWithdrawal(), "LongPool: withdrawals disabled");
    uint256 supply = totalSupply();
    return
      (supply == 0)
        ? _initialConvertToAssets(shares, rounding)
        : shares.mulDiv(computer.longPoolEquity(), supply, rounding);
    }

}