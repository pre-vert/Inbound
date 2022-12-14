const { deployments, ethers } = require("hardhat")
const { assert } = require("chai")
const assetDeposit = 30
const assetDeposit2 = 20
const allowedValue = 90
const transferValue = 40
// const scale = 10e8;

describe("Tests of LongPool deposit", async function () {
    let Computer, LongPool, ShortPool, ERC20, deployer
    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        ERC20 = await ethers.getContract("ERC20", deployer)         // get the most recent deployed contract
        Computer = await ethers.getContract("Computer", deployer)
        LongPool = await ethers.getContract("LongPool", deployer)
        ShortPool = await ethers.getContract("ShortPool", deployer)
    })

    describe("Test adresses", async function () {
        it("t1.1.1 The pool is linked to the correct asset address", async function () {
            const assetAddress = await LongPool.assetAddress()
            console.log("Fetched ERC20 address: " + assetAddress)
            console.log("Correct ERC20 address: " + ERC20.address)
            assert.equal(assetAddress, ERC20.address)
        })
        it("t1.1.2 The pool is linked to the correct computer address", async function () {
            const computerAddress = await LongPool.computerAddress()
            console.log("Fetched computer address: " + computerAddress)
            console.log("Correct ERC20 address: " + Computer.address)
            assert.equal(computerAddress, Computer.address)
        })
    })

    describe("Test deposit()", async function () {
        
        it("t1.2 Deposit changes depositor and Pool asset balances correctly", async function () {
            const assetBalanceLPT1 = await ERC20.balanceOf(LongPool.address)
            console.log("Asset in Long Pool: " + (assetBalanceLPT1).toString())
            console.log("Long Pool equity: " + await Computer.longPoolEquity())
            const accounts = await ethers.getSigners()
            const assetBalanceA0T1 = await ERC20.balanceOf(accounts[0].address)
            console.log("Depositor asset: " + (assetBalanceA0T1).toString())
            await ERC20.approve(LongPool.address, allowedValue)
            await LongPool.deposit(assetDeposit, accounts[0].address)
            console.log("Depositor deposits " + assetDeposit)
            const assetBalanceResponse = await ERC20.balanceOf(accounts[0].address)
            console.log("Depositor asset: " + (assetBalanceResponse).toString())
            const assetBalanceA0T2 = assetBalanceA0T1-assetDeposit
            assert.equal(assetBalanceResponse,assetBalanceA0T2)
            const assetBalanceLPResponse = await ERC20.balanceOf(LongPool.address)
            console.log("Long Pool total asset (via balanceOf): " + (assetBalanceLPResponse).toString())
            const assetBalanceLPResponseBis = await LongPool.totalAssets()
            console.log("Long Pool total asset (via totalAssets()): " + (assetBalanceLPResponseBis).toString())
            assert.equal(assetBalanceLPResponse.toString(),assetBalanceLPResponseBis.toString())
            const assetBalanceLPT2 = Number(assetBalanceLPT1)+Number(assetDeposit)
            console.log("Computed asset in Long Pool: " + assetBalanceLPT2)
            assert.equal(assetBalanceLPResponse,assetBalanceLPT2)
        })

        it("t1.3 Deposit changes depositor and Pool asset balances correctly in Small Pool", async function () {
            const accounts = await ethers.getSigners()
            console.log("T0 Long pool equity: " + await Computer.longPoolEquity())
            console.log("T0 Short pool equity: " + await Computer.shortPoolEquity())
            await ERC20.approve(LongPool.address, allowedValue)
            await LongPool.deposit(assetDeposit2, accounts[0].address)
            console.log("Depositor deposits in long pool " + assetDeposit2)
            console.log("T1 Long pool equity: " + await Computer.longPoolEquity())
            console.log("T1 Short pool equity: " + await Computer.shortPoolEquity())
            await ERC20.approve(ShortPool.address, allowedValue)
            await ShortPool.deposit(assetDeposit, accounts[0].address)
            console.log("Depositor deposits in short pool " + assetDeposit)
            console.log("T2 Asset in Long Pool: " + (await ERC20.balanceOf(LongPool.address)).toString())
            console.log("T2 Asset in Short Pool: " + (await ERC20.balanceOf(ShortPool.address)).toString())
            console.log("T2 Long pool equity: " + await Computer.longPoolEquity())
            console.log("T2 Short pool equity: " + await Computer.shortPoolEquity())
            await LongPool.deposit(assetDeposit2, accounts[0].address)
            console.log("Depositor deposits in long pool " + assetDeposit2)
            console.log("T3 Asset in Long Pool: " + (await ERC20.balanceOf(LongPool.address)).toString())
            console.log("T3 Asset in Short Pool: " + (await ERC20.balanceOf(ShortPool.address)).toString())
            console.log("T3 Long pool equity: " + await Computer.longPoolEquity())
            console.log("T3 Short pool equity: " + await Computer.shortPoolEquity())
        })

        it("t1.4 Deposit changes depositor and Pool asset balances correctly in Big Pool", async function () {
            const accounts = await ethers.getSigners()
            console.log("T0 Long pool equity: " + await Computer.longPoolEquity())
            console.log("T0 Short pool equity: " + await Computer.shortPoolEquity())
            await ERC20.approve(LongPool.address, allowedValue)
            await LongPool.deposit(assetDeposit, accounts[0].address)
            console.log("Depositor deposits in long pool " + assetDeposit)
            console.log("T1 Long pool equity: " + await Computer.longPoolEquity())
            console.log("T1 Short pool equity: " + await Computer.shortPoolEquity())
            await ERC20.approve(ShortPool.address, allowedValue)
            await ShortPool.deposit(assetDeposit2, accounts[0].address)
            console.log("Depositor deposits in short pool " + assetDeposit2)
            console.log("T2 Asset in Long Pool: " + (await ERC20.balanceOf(LongPool.address)).toString())
            console.log("T2 Asset in Short Pool: " + (await ERC20.balanceOf(ShortPool.address)).toString())
            console.log("T2 Long pool equity: " + await Computer.longPoolEquity())
            console.log("T2 Short pool equity: " + await Computer.shortPoolEquity())
            await LongPool.deposit(assetDeposit2, accounts[0].address)
            console.log("Depositor deposits in long pool " + assetDeposit2)
            console.log("T3 Asset in Long Pool: " + (await ERC20.balanceOf(LongPool.address)).toString())
            console.log("T3 Asset in Short Pool: " + (await ERC20.balanceOf(ShortPool.address)).toString())
            console.log("T3 Long pool equity: " + await Computer.longPoolEquity())
            console.log("T3 Short pool equity: " + await Computer.shortPoolEquity())
        })

        it("t1.5 Deposit changes depositor shares correctly", async function () {
            const accounts = await ethers.getSigners()
            const shareBalanceA0T1 = await LongPool.balanceOf(accounts[0].address)
            console.log("Depositor shares: " + (shareBalanceA0T1).toString())
            await ERC20.approve(LongPool.address, allowedValue)
            await LongPool.deposit(assetDeposit, accounts[0].address)
            console.log("Depositor deposits " + assetDeposit)
            const shareBalanceResponse = await LongPool.balanceOf(accounts[0].address)
            console.log("Depositor shares: " + (shareBalanceResponse).toString())
            const shareBalanceA0T2 = Number(shareBalanceA0T1)+Number(assetDeposit)
            console.log("Depositor shares calculated: " + shareBalanceA0T2)
            assert.equal(shareBalanceResponse, Number(shareBalanceA0T2))
        })

        it("t1.6 Deposit changes depositor_2 shares correctly", async function () {
            const accounts = await ethers.getSigners()
            const shareBalanceA0T1 = await LongPool.balanceOf(accounts[0].address)
            console.log("Depositor_1 intial shares: " + (shareBalanceA0T1).toString())
            await ERC20.approve(LongPool.address, allowedValue)
            await LongPool.deposit(assetDeposit, accounts[0].address)
            console.log("Depositor_1 deposits " + assetDeposit)
            console.log("Depositor_1 shares: " + (await LongPool.balanceOf(accounts[0].address)).toString())
            await ERC20.transfer(accounts[1].address, transferValue)
            console.log("Depositor_1 transfers " + transferValue + " to depositor_2")
            const LPConnectedAccount = await LongPool.connect(accounts[1])
            const assetBalanceA1T2 = await LongPool.balanceOf(accounts[1].address)
            console.log("Depositor_2 initial shares: " + (assetBalanceA1T2).toString())
            await LPConnectedAccount.approve(LongPool.address, allowedValue)
            await LongPool.deposit(assetDeposit2, accounts[1].address)
            console.log("Depositor_2 deposits " + assetDeposit2)
            const shareBalanceResponse = await LongPool.balanceOf(accounts[1].address)
            console.log("Depositor_2 shares: " + (shareBalanceResponse).toString())
        })

        it("t1.6 Deposit changes depositor_2 shares correctly after a price increase", async function () {
            await Computer.setPrice(100)
            console.log("Initial price: " + await Computer.getPrice())
            const accounts = await ethers.getSigners()
            const shareBalanceA0T1 = await LongPool.balanceOf(accounts[0].address)
            console.log("Depositor_1 intial shares: " + (shareBalanceA0T1).toString())
            console.log("Long pool equity: " + await Computer.longPoolEquity())
            await ERC20.approve(LongPool.address, allowedValue)
            await LongPool.deposit(assetDeposit, accounts[0].address)
            console.log("Depositor_1 deposits in long pool " + assetDeposit)
            console.log("Long pool equity: " + await Computer.longPoolEquity())
            const shareBalanceLongPoolD1 = await LongPool.balanceOf(accounts[0].address)
            console.log("Depositor_1 shares in long pool: " + (shareBalanceLongPoolD1).toString())
            await ERC20.approve(ShortPool.address, allowedValue)
            await ShortPool.deposit(assetDeposit2, accounts[0].address)
            console.log("Depositor_1 deposits in short pool " + assetDeposit2)
            console.log("Short pool equity: " + await Computer.shortPoolEquity())
            const shareBalanceShortPoolD1 = await ShortPool.balanceOf(accounts[0].address)
            console.log("Depositor_1 shares in short pool: " + (shareBalanceShortPoolD1).toString())
            // await Computer.setPrice(110)
            // console.log("Updated price: " + await Computer.getPrice())
            // console.log("Long pool equity: " + await Computer.longPoolEquity())
            // console.log("Short pool equity: " + await Computer.shortPoolEquity())

            // await ERC20.transfer(accounts[1].address, transferValue)
            // const LPConnectedAccount = await LongPool.connect(accounts[1])
            // console.log("Depositor 2 assets: " + (await ERC20.balanceOf(accounts[1].address)).toString())
            // await LPConnectedAccount.approve(LongPool.address, allowedValue)
            // await LongPool.deposit(assetDeposit2, accounts[1].address)

            console.log("Depositor_2 deposits in long pool " + assetDeposit)
            const shareBalanceResponseD2 = await LongPool.balanceOf(accounts[1].address)
            console.log("Depositor_2 shares in long pool: " + (shareBalanceResponseD2).toString())
        })
    })

})