// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.7.0) (token/ERC20/extensions/ERC4626.sol)

pragma solidity 0.8.7;

import "./ERC20.sol";
import "./Utils/SafeERC20.sol";
import "../Interfaces/IERC4626.sol";
import "./Utils/Math.sol";

/**
 * @dev Implementation of the ERC4626 "Tokenized Vault Standard" as defined in
 * https://eips.ethereum.org/EIPS/eip-4626[EIP-4626].
 *
 * This extension allows the minting and burning of "shares" (represented using the ERC20 inheritance)
 * in exchange for underlying "assets" through standardized {deposit}, {mint}, {redeem}
 * and {burn} workflows. This contract extends the ERC20 standard. Any additional
 * extensions included along it would affect the "shares" token represented by this
 * contract and not the "assets" token which is an independent contract.
 *
 * CAUTION: Deposits and withdrawals may incur unexpected slippage. Users should verify
 * that the amount received of shares or assets is as expected. EOAs should operate
 * through a wrapper that performs these checks such as
 * https://github.com/fei-protocol/ERC4626#erc4626router-and-base[ERC4626Router].
 *
 * _Available since v4.7._
 */

abstract contract ERC4626 is ERC20, IERC4626 {
    using Math for uint256;

    ERC20 internal asset;                    // base token
    // uint256 public price = 1;
    // uint256 public oldPrice = price;

    constructor(ERC20 asset_){   
        asset = asset_;
    }

    /**************************************************************** */
    //              Price (non-ERC4626/Vault logic)
    /**************************************************************** */

    // function transferToPool(uint _amount, address _poolAddress) private {
    //     require(_poolAddress != address(0), "cannot be 0 address");
    //     require(_amount <= totalAssets(), "cannot transfer more than total asset");
    //     transfer(_poolAddress, _amount);
    // }

    /**************************************************************** */
    //                     ERC4626 logic
    /**************************************************************** */

    /** @dev See {IERC4626-asset}. */
    function assetAddress() public view virtual override returns (address) {
        return address(asset);
    }

    // total amount of asset managed by the pool
    function totalAssets() public view virtual override returns (uint256) {
        return asset.balanceOf(address(this));
    }

    /** @dev See {IERC4626-convertToShares}. */
    function convertToShares(uint256 assets) public view virtual override returns (uint256 shares) {
        return _convertToShares(assets, Math.Rounding.Down);
    }

    /** @dev See {IERC4626-convertToAssets}. */
    function convertToAssets(uint256 shares) public view virtual override returns (uint256 assets) {
        return _convertToAssets(shares, Math.Rounding.Down);
    }

    /** @dev See {IERC4626-maxDeposit}. */
    // The Vault is closed to deposit if not collateralized
    function maxDeposit(address) public view virtual override returns (uint256) {
        return _isVaultCollateralized() ? type(uint256).max : 0;
    }

    /** @dev See {IERC4626-maxMint}. */
    function maxMint(address) public view virtual override returns (uint256) {
        return type(uint256).max;
    }

    // Max amount of asset that can be withdrawn from the pool by owner
    function maxWithdraw(address owner) public view virtual override returns (uint256) {
        return _convertToAssets(balanceOf(owner), Math.Rounding.Down);
    }

    /** @dev See {IERC4626-maxRedeem}. */
    function maxRedeem(address owner) public view virtual override returns (uint256) {
        return balanceOf(owner);
    }

    /** @dev See {IERC4626-previewDeposit}. */
    function previewDeposit(uint256 assets) public view virtual override returns (uint256) {
        return _convertToShares(assets, Math.Rounding.Down);
    }

    /** @dev See {IERC4626-previewMint}. */
    function previewMint(uint256 shares) public view virtual override returns (uint256) {
        return _convertToAssets(shares, Math.Rounding.Up);
    }

    /** @dev See {IERC4626-previewWithdraw}. */
    function previewWithdraw(uint256 assets) public view virtual override returns (uint256) {
        return _convertToShares(assets, Math.Rounding.Up);
    }

    /** @dev See {IERC4626-previewRedeem}. */
    function previewRedeem(uint256 shares) public view virtual override returns (uint256) {
        return _convertToAssets(shares, Math.Rounding.Down);
    }

    /** @dev See {IERC4626-deposit}. */
    function deposit(uint256 assets, address receiver) public virtual override returns (uint256) {
        require(assets <= maxDeposit(receiver), "ERC4626: deposit more than max");
        require(assets > 0, "ERC4626: Deposit less than Zero");
        uint256 shares = previewDeposit(assets);
        _deposit(_msgSender(), receiver, assets, shares);
        // the one who deposits, the one who receives shares, value deposited, shares received
        return shares;
    }

    /** @dev See {IERC4626-mint}. */
    function mint(uint256 shares, address receiver) public virtual override returns (uint256) {
        require(shares <= maxMint(receiver), "ERC4626: mint more than max");
        uint256 assets = previewMint(shares);
        _deposit(_msgSender(), receiver, assets, shares);
        // the one who deposits, the one who receives shares, value deposited, shares received
        return assets;
    }

    /** @dev See {IERC4626-withdraw}. */
    function withdraw(
        uint256 assets,
        address receiver,    // the one who receives the assets
        address owner        // the one who owns the shares to be redeemed (burned)
    ) public virtual override returns (uint256) {
        require(assets <= maxWithdraw(owner), "ERC4626: withdraw more than max");
        uint256 shares = previewWithdraw(assets);
        _withdraw(_msgSender(), receiver, owner, assets, shares);
        // the one who withdraws, receives the assets, owns the shares

        return shares;
    }

    /** @dev See {IERC4626-redeem}. */
    function redeem(
        uint256 shares,
        address receiver,
        address owner
    ) public virtual override returns (uint256) {
        require(shares <= maxRedeem(owner), "ERCtotalAssets4626: redeem more than max");
        uint256 assets = previewRedeem(shares);
        _withdraw(_msgSender(), receiver, owner, assets, shares);
        return assets;
    }

    /**
     * @dev Internal conversion function (from assets to shares) with support for rounding direction.
     * Will revert if assets > 0, totalSupply > 0 and totalAssets = 0. That corresponds
     * to a case where any asset would represent an infinite amount of shares.
     */
    function _convertToShares(uint256 assets, Math.Rounding rounding)
        internal view virtual returns (uint256 shares) {
        uint256 supply = totalSupply();
        return
            (assets == 0 || supply == 0)
                ? _initialConvertToShares(assets, rounding)
                : assets.mulDiv(supply, totalAssets(), rounding);
    }
    /*
        a = asset
        A = totalAssets()
        S = totalSupply()
        s = shares to mint
        (S + s) / S = (a + A) / B => s / S = a / A
        s = a S / A
    */

    /**
     * @dev Internal conversion function (from assets to shares) to apply when the vault
     * is empty. NOTE: Make sure to keep this function consistent with
     * {_initialConvertToAssets} when overriding it.
     */
    function _initialConvertToShares(uint256 assets, Math.Rounding)
    internal view virtual returns (uint256 shares) {
        return assets;
    }

    /**
     * @dev Internal conversion function (from shares to assets) with support for rounding direction.
     */
    function _convertToAssets(uint256 shares, Math.Rounding rounding) internal view virtual returns (uint256 assets) {
        uint256 supply = totalSupply();
        return
            (supply == 0)
                ? _initialConvertToAssets(shares, rounding)
                : shares.mulDiv(totalAssets(), supply, rounding);
    }
    /*
        a = asset
        A = totalAsset()
        S = totalSupply()
        s = shares to burn
        (A - a) / A = (S - s) / S
        a / A = s / S
    */

    /**
     * @dev Internal conversion function (from shares to assets) to apply when the vault is empty.
     * NOTE: Make sure to keep this function consistent with {_initialConvertToShares} when overriding it.
     */
    function _initialConvertToAssets(uint256 shares, Math.Rounding)
    internal view virtual returns (uint256 assets) {
        return shares;
    }

    /**
     * @dev Deposit/mint common workflow.
     * If _asset is ERC777, `transferFrom` can trigger a reenterancy BEFORE the transfer happens through
       the `tokensToSend` hook. On the other hand, the `tokenReceived` hook, that is triggered after the
       transfer, calls the vault, which is assumed not malicious.
       Conclusion: we need to do the transfer before we mint so that any reentrancy would happen before the
       assets are transferred and before the shares are minted, which is a valid state.
       slither-disable-next-line reentrancy-no-eth
     */
    function _deposit(
        address caller,          // from : the one who deposits (_msgSender())
        address receiver,        // the one who receives shares
        uint256 assets,
        uint256 shares
    ) internal virtual {
        SafeERC20.safeTransferFrom(
            asset,             // _asset transferred from caller to contract
            caller,            // from depositor: _msgSender() (must give allowance before)
            address(this),     // to: ERC4626 contract
            assets);           // amount of assets transferred to contract
        _mint(receiver, shares);

        emit Deposit(caller, receiver, assets, shares);
    }

    /**
     * @dev Withdraw/redeem common workflow.
     * _withdraw(_msgSender(), receiver, owner, assets, shares);
     * If _asset is ERC777, `transfer` can trigger a reentrancy AFTER the transfer happens through the
       `tokensReceived` hook. On the other hand, the `tokensToSend` hook, that is triggered before the transfer,
       calls the vault, which is assumed not malicious.
       Conclusion: we need to do the transfer after the burn so that any reentrancy would happen after the
       shares are burned and after the assets are transferred, which is a valid state.
     */
    function _withdraw(
        address caller,      // _msgSender()
        address receiver,    // the one who receives the assets
        address owner,       // the one who owns the shares to be redeemed
        uint256 assets,
        uint256 shares
    ) internal virtual {
        if (caller != owner) {
            _spendAllowance(owner, caller, shares);
        }
        _burn(owner, shares);
        SafeERC20.safeTransfer(asset, receiver, assets);

        emit Withdraw(caller, receiver, owner, assets, shares);
    }

    // Vault not collateralized if totalAsset() == 0 AND totalSupply() > 0
    function _isVaultCollateralized() private view returns (bool) {
        return totalAssets() > 0 || totalSupply() == 0;
    }

}