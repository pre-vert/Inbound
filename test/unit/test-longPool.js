const { deployments, ethers } = require("hardhat")
const { assert } = require("chai")
const assetDeposit = 10
const assetTooBigDeposit = 150
const assetWithdraw = 5
const assetTooBigWithdraw = 20
const allowedValue = 50
const transferValue = 20

describe("LongPool", async function () {
    let LongPool, deployer
    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        ERC20 = await ethers.getContract("ERC20", deployer)      // get the most recent deployed contract
        LongPool = await ethers.getContract("LongPool", deployer)
    })

    describe("deposit", async function () {
        
        it("The pool is linked to the correct asset address", async function () {
            const assetAddress = await LongPool.asset()
            console.log("Fetched ERC20 address: " + assetAddress)
            console.log("Correct ERC20 address: " + ERC20.address)
            assert.equal(assetAddress, ERC20.address)
        })
        
        it("Deposit changes caller and Pool asset balances correctly", async function () {
            const assetBalanceLPT1 = await ERC20.balanceOf(LongPool.address)
            console.log("Asset in Long Pool: " + (assetBalanceLPT1).toString())
            const accounts = await ethers.getSigners()
            const assetBalanceA0T1 = await ERC20.balanceOf(accounts[0].address)
            console.log("First depositor asset before anything: " + (assetBalanceA0T1).toString())
            await ERC20.approve(LongPool.address, allowedValue)
            console.log("First depositor approves " + allowedValue)
            await LongPool.deposit(assetDeposit, accounts[0].address)
            console.log("First depositor deposits " + assetDeposit)
            const assetBalanceResponse = await ERC20.balanceOf(accounts[0].address)
            console.log("First depositor asset AFTER deposit: " + (assetBalanceResponse).toString())
            const assetBalanceA0T2 = assetBalanceA0T1-assetDeposit
            assert.equal(assetBalanceResponse,assetBalanceA0T2)
            const assetBalanceLPResponse = await ERC20.balanceOf(LongPool.address)
            console.log("Long Pool total asset (via balanceOf): " + (assetBalanceLPResponse).toString())
            const assetBalanceLPResponseBis = await LongPool.totalAssets()
            console.log("Long Pool total asset (via totalAssets()): " + (assetBalanceLPResponseBis).toString())
            assert.equal(assetBalanceLPResponse.toString(),assetBalanceLPResponseBis.toString())
            const assetBalanceLPT2 = Number(assetBalanceLPT1+assetDeposit)
            console.log("Computed asset in Long Pool: " + assetBalanceLPT2)
            assert.equal(assetBalanceLPResponse,assetBalanceLPT2)
        })

        it("Withdraw changes caller and Pool asset balances correctly", async function () {
            const assetBalanceLPT1 = await LongPool.totalAssets()
            console.log("Long Pool total asset: " + (assetBalanceLPT1).toString())
            const accounts = await ethers.getSigners()
            const assetBalanceA0T1 = await ERC20.balanceOf(accounts[0].address)
            console.log("Caller asset balance before deposit: " + (assetBalanceA0T1).toString())
            await ERC20.approve(LongPool.address, allowedValue)
            console.log("Caller approves " + allowedValue)
            await LongPool.deposit(assetDeposit, accounts[0].address)
            console.log("Caller deposits " + assetDeposit)
            const assetBalanceA0T2 = await ERC20.balanceOf(accounts[0].address)
            console.log("Caller asset balance after deposit: " + (assetBalanceA0T2).toString())
            const assetBalanceLPT2 = await LongPool.totalAssets()
            console.log("Long Pool total asset: " + (assetBalanceLPT2).toString())
            const maxAssetWithdraw = await LongPool.maxWithdraw(accounts[0].address)
            console.log("Caller max asset withdraw: " + maxAssetWithdraw)
            await LongPool.withdraw(assetWithdraw, accounts[0].address, accounts[0].address)
            console.log("Caller withdraw: " + assetWithdraw)
            const assetBalanceA0Response = await ERC20.balanceOf(accounts[0].address)
            console.log("Caller asset balance after withdraw: " + (assetBalanceA0Response).toString())
            const assetBalanceA0T3 = Number(assetBalanceA0T1)-Number(assetDeposit)+Number(assetWithdraw)
            console.log("Caller assets after withdraw (calculated): " + assetBalanceA0T3)
            assert.equal((assetBalanceA0Response).toString(), assetBalanceA0T3)
            const assetBalanceLPT3 = await LongPool.totalAssets()
            console.log("Long Pool total asset: " + (assetBalanceLPT3).toString())

        })

        it("Deposit changes caller shares correctly", async function () {
            const accounts = await ethers.getSigners()
            const shareBalanceA0T1 = await LongPool.balanceOf(accounts[0].address)
            console.log("Depositor shares: " + (shareBalanceA0T1).toString())
            await ERC20.approve(LongPool.address, allowedValue)
            console.log("Depositor approves " + allowedValue)
            await LongPool.deposit(assetDeposit, accounts[0].address)
            console.log("Depositor deposits " + assetDeposit)
            const shareBalanceResponse = await LongPool.balanceOf(accounts[0].address)
            console.log("Depositor shares AFTER deposit: " + (shareBalanceResponse).toString())
            const shareBalanceA0T2 = shareBalanceA0T1+assetDeposit
            assert.equal(shareBalanceResponse, Number(shareBalanceA0T2))
        })

        it("Withdraw changes caller shares correctly", async function () {
            const accounts = await ethers.getSigners()
            const shareBalanceA0T1 = await LongPool.balanceOf(accounts[0].address)
            console.log("Caller intial shares: " + (shareBalanceA0T1).toString())
            await ERC20.approve(LongPool.address, allowedValue)
            console.log("Caller approves contract for " + allowedValue)
            await LongPool.deposit(assetDeposit, accounts[0].address)
            console.log("Caller deposits " + assetDeposit)
            const maxAssetWithdraw = await LongPool.maxWithdraw(accounts[0].address)
            console.log("Caller max asset withdraw: " + maxAssetWithdraw)
            await LongPool.withdraw(assetWithdraw, accounts[0].address, accounts[0].address)
            console.log("Caller withdraw: " + assetWithdraw)
            const shareBalanceResponse = await LongPool.balanceOf(accounts[0].address)
            console.log("Depositor shares after withdraw: " + (shareBalanceResponse).toString())
            const shareBalanceA0T2 = shareBalanceA0T1+assetDeposit-assetWithdraw
            console.log("Depositor shares after withdraw (calculated): " + shareBalanceA0T2)
            assert.equal((shareBalanceResponse).toString(), Number(shareBalanceA0T2))
        })   

        it("Deposit changes second depositor shares correctly", async function () {
            const accounts = await ethers.getSigners()
            const shareBalanceA0T1 = await LongPool.balanceOf(accounts[0].address)
            console.log("Fisrt depositor intial shares: " + (shareBalanceA0T1).toString())
            await ERC20.approve(LongPool.address, allowedValue)
            console.log("First depositor approves contract for " + allowedValue)
            await LongPool.deposit(assetDeposit, accounts[0].address)
            console.log("First depositor deposits " + assetDeposit)
            const assetBalanceA1T2 = await ERC20.balanceOf(accounts[1].address)
            console.log("Second depositor initial asset: " + (assetBalanceA1T2).toString())
            await ERC20.transfer(accounts[1].address, transferValue)
            console.log("First depositor transfers " + transferValue + " to second depositor")
            const LongPoolConnectedContract = await LongPool.connect(accounts[1])
            console.log("Second depositor connects to the pool")
            await LongPoolConnectedContract.approve(LongPool.address, allowedValue)
            console.log("Second depositor approves contract for " + allowedValue)
            await LongPool.deposit(assetDeposit, accounts[1].address)
            console.log("Second depositor deposits " + assetDeposit)
            const shareBalanceResponse = await LongPool.balanceOf(accounts[1].address)
            console.log("Second depositor shares after deposit: " + (shareBalanceResponse).toString())
            

        //     // 
        //     // const endingShareBalance = startingShareBalance+assetDeposit
        //     // assert.equal(responseShareBalance, Number(endingShareBalance))
        })
    })
})