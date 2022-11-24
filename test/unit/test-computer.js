const { deployments, ethers } = require("hardhat")
const { assert, expect } = require("chai")
const assetDeposit = 10
const allowedValue = 50
// const rebalancedValue = 4
// const assetWithdraw = 2

describe("Computer", async function () {
    let Computer, ERC20, LongPool, ShortPool, deployer
    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        ERC20 = await ethers.getContract("ERC20", deployer) 
        LongPool = await ethers.getContract("LongPool", deployer)
        ShortPool = await ethers.getContract("ShortPool", deployer)
        Computer = await ethers.getContract("Computer", deployer)
    })

    describe("3.1. Contract addresses", async function () {
        
        it("t3.1.1 Computer is linked to the correct asset address", async function () {
            const assetAddress = await Computer.assetAdress()
            console.log("Fetched asset address: " + assetAddress)
            console.log("Correct asset address: " + ERC20.address)     
            assert.equal(assetAddress, ERC20.address)
        })

        it("t3.1.2 Computer is linked to the correct LongPool address", async function () {
            const longPoolAddress = await Computer.longPoolAddress()
            console.log("Fetched long pool address: " + longPoolAddress)
            console.log("Correct long pool address: " + LongPool.address)     
            assert.equal(longPoolAddress, LongPool.address)
        })

        it("t3.1.3 Computer is linked to the correct ShortPool address", async function () {
            const shortPoolAddress = await Computer.shortPoolAddress()
            console.log("Fetched short pool address: " + shortPoolAddress)
            console.log("Correct short pool address: " + ShortPool.address)     
            assert.equal(shortPoolAddress, ShortPool.address)
        })
    })

    describe("longPoolEquity()", async function () {
            
        it("t3.2 Finds min collateral", async function () {
            const assetBalanceLPT1 = await LongPool.totalAssets()
            console.log("Total asset in Long Pool: " + assetBalanceLPT1.toString())
            const assetBalanceSPT1 = await ShortPool.totalAssets()
            console.log("Total asset in Short Pool: " + assetBalanceSPT1.toString())
            const minCalculated = Math.min(Number(assetBalanceLPT1), Number(assetBalanceSPT1))
            console.log("Min collateral: " + minCalculated)
        })

        it("t3.3 Long and short solvent correctly calculated", async function () {
            const price = await Computer.getPrice()
            console.log("Price: " + price)
            const forwardPrice = await Computer.forwardPrice()
            console.log("Forward price: " + forwardPrice)
            const delta = await Computer.delta()
            console.log("Delta: " + delta)
            const longSolvent = await Computer.longSolvent()
            console.log("Long pool solvent: " + longSolvent)
            const shortSolvent = await Computer.shortSolvent()
            console.log("Short pool solvent: " + shortSolvent)
            const longSolventCalculated = Math.round((1 + delta * (price/forwardPrice - 1))*10e8)
            console.log("Calculated long pool solvent: " + longSolventCalculated)
            const shortSolventCalculated = Math.round((1 - delta * (price/forwardPrice - 1))*10e8)
            console.log("Calculated short pool solvent: " + shortSolventCalculated)
            assert.equal(longSolventCalculated.toString(), longSolvent.toString())
            assert.equal(shortSolventCalculated.toString(), shortSolvent.toString())
        })
        
        it("t3.4 Allow deposits", async function () {
            const assetBalanceLPT1 = await LongPool.totalAssets()
            console.log("Total asset in Long Pool: " + assetBalanceLPT1.toString())
            const assetBalanceSPT1 = await ShortPool.totalAssets()
            console.log("Total asset in Short Pool: " + assetBalanceSPT1.toString())
            const longPoolEquity = await Computer.longPoolEquity()
            console.log("Long pool equity: " + longPoolEquity)
            const shortPoolEquity = await Computer.shortPoolEquity()
            console.log("Short pool equity: " + shortPoolEquity)
            const longSolvent = await Computer.longSolvent()
            console.log("Long pool solvent: " + longSolvent)
            const shortSolvent = await Computer.shortSolvent()
            console.log("Short pool solvent: " + shortSolvent)
            const allow = await Computer.allowDeposit()
            console.log("Allow deposit: " + allow)
            assert.equal(allow, true)
        })

        it("t3.5 Disable deposits", async function () {
            const price1 = await Computer.getPrice()
            console.log("Initial price: " + price1)
            await Computer.setPrice(200)
            const price2 = await Computer.getPrice()
            console.log("Updated price: " + price2)
            const assetBalanceLPT1 = await LongPool.totalAssets()
            console.log("Total asset in Long Pool: " + assetBalanceLPT1.toString())
            const assetBalanceSPT1 = await ShortPool.totalAssets()
            console.log("Total asset in Short Pool: " + assetBalanceSPT1.toString())
            const longPoolEquity = await Computer.longPoolEquity()
            console.log("Long pool equity: " + longPoolEquity)
            const shortPoolEquity = await Computer.shortPoolEquity()
            console.log("Short pool equity: " + shortPoolEquity)
            const longSolvent = await Computer.longSolvent()
            console.log("Long pool solvent: " + longSolvent)
            const shortSolvent = await Computer.shortSolvent()
            console.log("Short pool solvent: " + shortSolvent)
            const allow = await Computer.allowDeposit()
            console.log("Allow deposit: " + allow)
            assert.equal(allow, false)
        })

    })

})
            
            // await Computer.rebalance() // LongPool.address, rebalancedValue
            // console.log("*** Caller A0 rebalances " + rebalancedValue + " from Long Pool to Short Pool")
            // const assetBalanceLPResponse = await LongPool.totalAssets()
            // console.log("Total asset in Long Pool (balance): " + assetBalanceLPResponse.toString())
            // const assetBalanceLPT3 = assetBalanceLPT2.toString() - rebalancedValue
            // console.log("Total asset in Long Pool (calculated): " + assetBalanceLPT3.toString())
            // const assetBalanceSPResponse = await ShortPool.totalAssets()
            // console.log("Total asset in Short Pool (balance): " + assetBalanceSPResponse)
            // const assetBalanceSPT3 = Number(assetBalanceSPT1) + Number(rebalancedValue)
            // console.log("Total asset in Short Pool (calculated): " + assetBalanceSPT3.toString())
            // assert.equal(assetBalanceSPResponse, assetBalanceSPT3)
            // const assetBalanceA0T3 = await ERC20.balanceOf(accounts[0].address)
            // console.log("Caller asset balance " + assetBalanceA0T3)
            // assert.equal(assetBalanceA0T2.toString(), assetBalanceA0T3.toString())
    
        
    // describe("rebalance()", async function () {
            
    //     it("Transfer from long to short executed correctly after rebalancing", async function () {
    //         const assetBalanceLPT1 = await LongPool.totalAssets()
    //         console.log("Total asset in Long Pool: " + assetBalanceLPT1.toString())
    //         const assetBalanceSPT1 = await ShortPool.totalAssets()
    //         console.log("Total asset in Short Pool: " + assetBalanceSPT1.toString())
    //         const accounts = await ethers.getSigners()
    //         await ERC20.approve(LongPool.address, allowedValue)
    //         await LongPool.deposit(assetDeposit, accounts[0].address)
    //         console.log("Caller deposits " + assetDeposit)
    //         const assetBalanceLPT2 = await LongPool.totalAssets()
    //         console.log("Total asset in Long Pool: " + assetBalanceLPT2.toString())
    //         const assetBalanceA0T2 = await ERC20.balanceOf(accounts[0].address)
    //         console.log("Caller asset balance: " + assetBalanceA0T2)
    //         await Computer.rebalance() // LongPool.address, rebalancedValue
    //         console.log("*** Caller A0 rebalances " + rebalancedValue + " from Long Pool to Short Pool")
    //         const assetBalanceLPResponse = await LongPool.totalAssets()
    //         console.log("Total asset in Long Pool (balance): " + assetBalanceLPResponse.toString())
    //         const assetBalanceLPT3 = assetBalanceLPT2.toString() - rebalancedValue
    //         console.log("Total asset in Long Pool (calculated): " + assetBalanceLPT3.toString())
    //         const assetBalanceSPResponse = await ShortPool.totalAssets()
    //         console.log("Total asset in Short Pool (balance): " + assetBalanceSPResponse)
    //         const assetBalanceSPT3 = Number(assetBalanceSPT1) + Number(rebalancedValue)
    //         console.log("Total asset in Short Pool (calculated): " + assetBalanceSPT3.toString())
    //         assert.equal(assetBalanceSPResponse, assetBalanceSPT3)
    //         const assetBalanceA0T3 = await ERC20.balanceOf(accounts[0].address)
    //         console.log("Caller asset balance " + assetBalanceA0T3)
    //         assert.equal(assetBalanceA0T2.toString(), assetBalanceA0T3.toString())
    //     })
    // })
    
    // describe("transferAssetTo()", async function () {

    //     it("Fails if transfer from long to short directly called from long pool", async function () {
    //         const accounts = await ethers.getSigners()
    //         await ERC20.approve(LongPool.address, allowedValue)
    //         await LongPool.deposit(assetDeposit, accounts[0].address)
    //         await expect(LongPool.transferAssetTo(ShortPool.address, rebalancedValue)).to.be.revertedWith(
    //             "ERC4626: Not computer")
    //     })
    // })

    // describe("deposit() after rebalance()", async function () {

    //     it("New deposits calculated correctly after rebalancing", async function () {
    //         const accounts = await ethers.getSigners()
    //         await ERC20.approve(LongPool.address, allowedValue)
    //         await LongPool.deposit(assetDeposit, accounts[0].address)
    //         console.log("Caller deposit in Long Pool: " + assetDeposit)
    //         const assetBalanceLPT2 = await LongPool.totalAssets()
    //         console.log("Total asset in Long Pool: " + assetBalanceLPT2.toString())
    //         const shareBalanceA0T2 = await LongPool.balanceOf(accounts[0].address)
    //         console.log("Caller share balance in Long Pool: " + shareBalanceA0T2)
    //         await Computer.rebalance()
    //         console.log("*** Caller A0 rebalances " + rebalancedValue + " from Long Pool to Short Pool")
    //         const assetBalanceLPT3 = await LongPool.totalAssets()
    //         console.log("Total asset in Long Pool: " + assetBalanceLPT3.toString())
    //         const assetBalanceSPT3 = await ShortPool.totalAssets()
    //         console.log("Total asset in Short Pool: " + assetBalanceSPT3)
    //         const shareBalanceA0T3 = await LongPool.balanceOf(accounts[0].address)
    //         console.log("Caller long pool share balance " + shareBalanceA0T3)
    //         const totalSharesLPT3 = await LongPool.totalSupply()
    //         console.log("Long Pool total shares (totalSupply()): " + totalSharesLPT3)
    //         await LongPool.deposit(assetDeposit, accounts[0].address)
    //         console.log("*** Caller second deposit in Long Pool: " + assetDeposit)
    //         const assetBalanceLPT4 = await LongPool.totalAssets()
    //         console.log("Total asset in Long Pool: " + assetBalanceLPT4.toString())
    //         const assetBalanceA0T4 = await ERC20.balanceOf(accounts[0].address)
    //         console.log("Caller new asset balance (balanceOf): " + assetBalanceA0T4)
    //         const totalSharesLPT4 = await LongPool.totalSupply()
    //         console.log("Long Pool total shares (totalSupply()): " + totalSharesLPT4)
    //         console.log("a (amount deposited): " + assetDeposit)
    //         console.log("S (total shares before deposit): " + totalSharesLPT3)
    //         console.log("A (total asset before deposit): " + assetBalanceLPT3)
    //         const newSharesMinted = Math.floor(Number(assetDeposit * totalSharesLPT3 / assetBalanceLPT3))
    //         console.log("New shares minted (s=aS/A): " + newSharesMinted)
    //         const shareBalanceA0T4 = Number(shareBalanceA0T2) + newSharesMinted
    //         console.log("Caller Long Pool share balance (calculated): " + shareBalanceA0T4.toString())
    //         const shareBalanceResponse = await LongPool.balanceOf(accounts[0].address)
    //         console.log("Caller new Long Pool share balance (balanceOf): " + shareBalanceResponse)
    //         assert.equal(shareBalanceResponse.toString(), shareBalanceA0T4)
    //     })
    // })
    
    // describe("withdraw() after rebalance()", async function () {

    //     it("Withdraw calculated correctly after rebalancing", async function () {
    //         const accounts = await ethers.getSigners()
    //         await ERC20.approve(LongPool.address, allowedValue)
    //         await LongPool.deposit(assetDeposit, accounts[0].address)
    //         console.log("Caller deposit in Long Pool: " + assetDeposit)
    //         const shareBalanceA0T2 = await LongPool.balanceOf(accounts[0].address)
    //         console.log("Caller Long Pool share balance: " + shareBalanceA0T2)
    //         await Computer.rebalance()
    //         console.log("Caller A0 rebalances " + rebalancedValue + " from Long Pool to Short Pool")
    //         const assetBalanceLPT3 = await LongPool.totalAssets()
    //         const shareBalanceA0T3 = await LongPool.balanceOf(accounts[0].address)
    //         console.log("Caller Long Pool share balance (unchanged): " + shareBalanceA0T3)
    //         const totalSharesLPT3 = await LongPool.totalSupply()
    //         await LongPool.withdraw(assetWithdraw, accounts[0].address, accounts[0].address)
    //         console.log("*** Caller withdraw from Long Pool: " + assetWithdraw + " ***")
    //         const assetBalanceLPT4 = await LongPool.totalAssets()
    //         console.log("Total asset in Long Pool: " + assetBalanceLPT4.toString())
    //         console.log("a (amount withdrawn): " + assetWithdraw)
    //         console.log("S (Long Pool total shares before withdraw): " + totalSharesLPT3)
    //         console.log("A (total asset before withdraw): " + assetBalanceLPT3)
    //         const sharesBurned = Math.ceil(Number(assetWithdraw * totalSharesLPT3 / assetBalanceLPT3))
    //         console.log("Shares burned (s=aS/A): " + sharesBurned)
    //         const totalSharesLPT4 = await LongPool.totalSupply()
    //         console.log("Long Pool new total shares: " + totalSharesLPT4)
    //         const shareBalanceA0T4 = Number(shareBalanceA0T2) - sharesBurned
    //         console.log("Caller Long Pool new share balance (calculated): " + shareBalanceA0T4.toString())
    //         const shareBalanceResponse = await LongPool.balanceOf(accounts[0].address)
    //         console.log("Caller Long Pool new share balance (balanceOf): " + shareBalanceResponse)
    //         assert.equal(shareBalanceResponse.toString(), shareBalanceA0T4)
    //     })

    // })

