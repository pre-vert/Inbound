const { deployments, ethers } = require("hardhat")
const { assert, expect } = require("chai")
const assetDeposit = 10
const allowedValue = 50
const rebalancedValue = 4

describe("Rebalancer", async function () {
    let Rebalancer, deployer
    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        ERC20 = await ethers.getContract("ERC20", deployer) 
        LongPool = await ethers.getContract("LongPool", deployer)
        ShortPool = await ethers.getContract("ShortPool", deployer)
        Rebalancer = await ethers.getContract("Rebalancer", deployer)
    })

    describe("Views", async function () {
        
        it("Rebalancer is linked to the correct asset address", async function () {
            const assetAddress = await Rebalancer.assetAdress()
            console.log("Fetched asset address: " + assetAddress)
            console.log("Correct asset address: " + ERC20.address)     
            assert.equal(assetAddress, ERC20.address)
        })

        it("Rebalancer is linked to the correct LongPool address", async function () {
            const longPoolAddress = await Rebalancer.longPool()
            console.log("Fetched long pool address: " + longPoolAddress)
            console.log("Correct long pool address: " + LongPool.address)     
            assert.equal(longPoolAddress, LongPool.address)
        })

        it("Rebalancer is linked to the correct ShortPool address", async function () {
            const shortPoolAddress = await Rebalancer.shortPool()
            console.log("Fetched short pool address: " + shortPoolAddress)
            console.log("Correct short pool address: " + ShortPool.address)     
            assert.equal(shortPoolAddress, ShortPool.address)
        })
        
        it("Transfer from long to short executed correctly after rebalancing", async function () {
            const assetBalanceLPT1 = await LongPool.totalAssets()
            console.log("Total asset in Long Pool: " + assetBalanceLPT1.toString())
            const assetBalanceSPT1 = await ShortPool.totalAssets()
            console.log("Total asset in Short Pool: " + assetBalanceSPT1.toString())
            const accounts = await ethers.getSigners()
            await ERC20.approve(LongPool.address, allowedValue)
            await LongPool.deposit(assetDeposit, accounts[0].address)
            console.log("Caller deposits " + assetDeposit)
            const assetBalanceLPT2 = await LongPool.totalAssets()
            console.log("Total asset in Long Pool: " + assetBalanceLPT2.toString())
            const assetBalanceA0T2 = await ERC20.balanceOf(accounts[0].address)
            console.log("Caller asset balance: " + assetBalanceA0T2)
            await Rebalancer.rebalance(LongPool.address, rebalancedValue)
            console.log("Caller A0 rebalances " + rebalancedValue + " from long pool to short pool")
            const assetBalanceLPResponse = await LongPool.totalAssets()
            console.log("Total asset in Long Pool (balance): " + assetBalanceLPResponse.toString())
            const assetBalanceLPT3 = assetBalanceLPT2.toString() - rebalancedValue
            console.log("Total asset in Long Pool (calculated): " + assetBalanceLPT3.toString())
            const assetBalanceSPResponse = await ShortPool.totalAssets()
            console.log("Total asset in Short Pool (balance): " + assetBalanceSPResponse)
            const assetBalanceSPT3 = Number(assetBalanceSPT1) + Number(rebalancedValue)
            console.log("Total asset in Short Pool (calculated): " + assetBalanceSPT3.toString())
            assert.equal(assetBalanceSPResponse, assetBalanceSPT3)
            const assetBalanceA0T3 = await ERC20.balanceOf(accounts[0].address)
            console.log("Caller asset balance " + assetBalanceA0T3)
            assert.equal(assetBalanceA0T2.toString(), assetBalanceA0T3.toString())
        })

        it("Fails if transfer from long to short directly called from long pool",
        async function () {
            const accounts = await ethers.getSigners()
            await ERC20.approve(LongPool.address, allowedValue)
            await LongPool.deposit(assetDeposit, accounts[0].address)
            await expect(LongPool.transferAssetTo(ShortPool.address, rebalancedValue)).to.be.revertedWith(
                "ERC4626: Not rebalancer"
            )
        })

        it("New deposits calculated correctly after rebalancing", async function () {
            const accounts = await ethers.getSigners()
            await ERC20.approve(LongPool.address, allowedValue)
            await LongPool.deposit(assetDeposit, accounts[0].address)
            console.log("Caller deposit in Long Pool: " + assetDeposit)
            const assetBalanceLPT2 = await LongPool.totalAssets()
            console.log("Total asset in Long Pool: " + assetBalanceLPT2.toString())
            const shareBalanceA0T2 = await LongPool.balanceOf(accounts[0].address)
            console.log("Caller share balance in Long Pool: " + shareBalanceA0T2)
            await Rebalancer.rebalance(LongPool.address, rebalancedValue)
            console.log("Caller A0 rebalances " + rebalancedValue + " from long pool to short pool")
            const assetBalanceLPT3 = await LongPool.totalAssets()
            console.log("Total asset in Long Pool: " + assetBalanceLPT3.toString())
            const assetBalanceSPT3 = await ShortPool.totalAssets()
            console.log("Total asset in Short Pool: " + assetBalanceSPT3)
            const shareBalanceA0T3 = await LongPool.balanceOf(accounts[0].address)
            console.log("Caller long pool share balance " + shareBalanceA0T3)
            const totalSharesLPT3 = await LongPool.totalSupply()
            console.log("Long Pool total shares (totalSupply()): " + totalSharesLPT3)
            await LongPool.deposit(assetDeposit, accounts[0].address)
            console.log("Caller second deposit in Long Pool: " + assetDeposit)
            const assetBalanceLPT4 = await LongPool.totalAssets()
            console.log("Total asset in Long Pool: " + assetBalanceLPT4.toString())
            const assetBalanceA0T4 = await ERC20.balanceOf(accounts[0].address)
            console.log("Caller new asset balance (balanceOf): " + assetBalanceA0T4)
            const totalSharesLPT4 = await LongPool.totalSupply()
            console.log("Long Pool total shares (totalSupply()): " + totalSharesLPT4)
            console.log("a (amount deposited): " + assetDeposit)
            console.log("S (total shares before deposit): " + totalSharesLPT3)
            console.log("A (total asset before deposit): " + assetBalanceLPT3)
            const newSharesMinted = Math.floor(Number(assetDeposit * totalSharesLPT3 / assetBalanceLPT3))
            console.log("New shares minted (s=aS/A): " + newSharesMinted)
            const shareBalanceA0T4 = Number(shareBalanceA0T2) + newSharesMinted
            console.log("Caller Long Pool share balance (calculated): " + shareBalanceA0T4.toString())
            const shareBalanceResponse = await LongPool.balanceOf(accounts[0].address)
            console.log("Caller new Long Pool share balance (balanceOf): " + shareBalanceResponse)
            assert.equal(shareBalanceResponse.toString(), shareBalanceA0T4)

        })

    })

//         it("Deposit changes caller ERC20 asset balance", async function () {
//             const accounts = await ethers.getSigners()
//             await ERC20.approve(ERC4626Long.address, allowedValue)
//             console.log("Depositor approves Long: " + allowedValue)
//             await ERC4626Long.deposit(assetDeposit, accounts[0].address)
//             console.log("Depositor deposits " + assetDeposit)
//         })
//     })
})

