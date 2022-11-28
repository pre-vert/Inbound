const { deployments, ethers } = require("hardhat")
const { assert } = require("chai")
const assetDeposit = 30
const assetDeposit2 = 20
// const assetTooBigDeposit = 150
const assetWithdraw = 10
// const assetTooBigWithdraw = 20
const allowedValue = 90
const transferValue = 40
const scale = 10e8;

describe("Tests of LongPool withdraw", async function () {
    let Computer, LongPool, ShortPool, ERC20, deployer
    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        ERC20 = await ethers.getContract("ERC20", deployer)         // get the most recent deployed contract
        Computer = await ethers.getContract("Computer", deployer)
        LongPool = await ethers.getContract("LongPool", deployer)
        ShortPool = await ethers.getContract("ShortPool", deployer)
    })

    describe("Test withdraw()", async function () {

        it("t2.1 Withdraw changes depositor and Pool asset balances correctly", async function () {
            const assetBalanceLPT1 = await LongPool.totalAssets()
            console.log("Long Pool total asset: " + (assetBalanceLPT1).toString())
            const accounts = await ethers.getSigners()
            const assetBalanceA0T1 = await ERC20.balanceOf(accounts[0].address)
            console.log("Depositor initial asset: " + (assetBalanceA0T1).toString())
            await ERC20.approve(LongPool.address, allowedValue)
            await LongPool.deposit(assetDeposit, accounts[0].address)
            console.log("Depositor deposits " + assetDeposit)
            const assetBalanceA0T2 = await ERC20.balanceOf(accounts[0].address)
            console.log("Depositor asset balance after deposit: " + (assetBalanceA0T2).toString())
            const assetBalanceLPT2 = await LongPool.totalAssets()
            console.log("Long Pool total asset: " + (assetBalanceLPT2).toString())
            const maxAssetWithdraw = await LongPool.maxWithdraw(accounts[0].address)
            console.log("Depositor max asset withdrawable: " + maxAssetWithdraw)
            await LongPool.withdraw(assetWithdraw, accounts[0].address, accounts[0].address)
            console.log("Depositor withdraw: " + assetWithdraw)
            const assetBalanceA0Response = await ERC20.balanceOf(accounts[0].address)
            console.log("Depositor asset balance after withdraw: " + (assetBalanceA0Response).toString())
            const assetBalanceA0T3 = Number(assetBalanceA0T1)-Number(assetDeposit)+Number(assetWithdraw)
            console.log("Depositor assets after withdraw (calculated): " + assetBalanceA0T3)
            assert.equal((assetBalanceA0Response).toString(), assetBalanceA0T3)
            const assetBalanceLPT3 = await LongPool.totalAssets()
            console.log("Long Pool total asset: " + (assetBalanceLPT3).toString())
        })

        it("t2.2 Withdraw changes depositor shares correctly", async function () {
            const accounts = await ethers.getSigners()
            const shareBalanceA0T1 = await LongPool.balanceOf(accounts[0].address)
            console.log("Depositor intial shares: " + (shareBalanceA0T1).toString())
            await ERC20.approve(LongPool.address, allowedValue)
            await LongPool.deposit(assetDeposit, accounts[0].address)
            console.log("Depositor deposits " + assetDeposit)
            const maxAssetWithdraw = await LongPool.maxWithdraw(accounts[0].address)
            console.log("Depositor max asset withdraw: " + maxAssetWithdraw)
            await LongPool.withdraw(assetWithdraw, accounts[0].address, accounts[0].address)
            console.log("Depositor withdraw: " + assetWithdraw)
            const shareBalanceResponse = await LongPool.balanceOf(accounts[0].address)
            console.log("Depositor shares after withdraw: " + (shareBalanceResponse).toString())
            const shareBalanceA0T2 = Number(shareBalanceA0T1)+Number(assetDeposit)-Number(assetWithdraw)
            console.log("Depositor shares after withdraw (calculated): " + shareBalanceA0T2)
            assert.equal((shareBalanceResponse).toString(), Number(shareBalanceA0T2))
        })

        it("t2.3 Withdraw changes depositor and Pool asset balances correctly after a price change", async function () {
            await Computer.setPrice(100)
            const price = await Computer.getPrice()
            console.log("Initial price: " + price)
            const assetBalanceLPT1 = await LongPool.totalAssets()
            console.log("Long Pool total asset: " + (assetBalanceLPT1).toString())
            const accounts = await ethers.getSigners()
            await ERC20.approve(LongPool.address, allowedValue)
            await LongPool.deposit(assetDeposit, accounts[0].address)
            console.log("Depositor deposits in long pool: " + assetDeposit)
            const assetBalanceA0T2 = await ERC20.balanceOf(accounts[0].address)
            console.log("Depositor asset balance after deposit: " + (assetBalanceA0T2).toString())
            const assetBalanceLPT2 = await LongPool.totalAssets()
            console.log("Long Pool total asset: " + (assetBalanceLPT2).toString())
            await ERC20.approve(ShortPool.address, allowedValue)
            await ShortPool.deposit(assetDeposit2, accounts[0].address)
            console.log("Depositor deposits in short pool: " + assetDeposit2)
            const assetBalanceA0T3 = await ERC20.balanceOf(accounts[0].address)
            console.log("Depositor asset balance after the two deposits: " + (assetBalanceA0T3).toString())
            const assetBalanceSPT3 = await ShortPool.totalAssets()
            console.log("Short Pool total asset: " + (assetBalanceSPT3).toString())
            maxWithdraw = await LongPool.maxWithdraw(accounts[0].address)
            console.log("Depositor maximum assets withdrawable: " + maxWithdraw)
            await Computer.setPrice(120)
            const price2 = await Computer.getPrice()
            console.log("Updated price: " + price2)
            maxWithdraw = await LongPool.maxWithdraw(accounts[0].address)
            console.log("Depositor maximum assets withdrawable: " + maxWithdraw)
            // await LongPool.withdraw(maxWithdraw, accounts[0].address, accounts[0].address)
            // console.log("Depositor withdraw: " + maxWithdraw)
            // const assetBalanceA0Response = await ERC20.balanceOf(accounts[0].address)
            // console.log("Depositor asset balance after withdrawal: " + (assetBalanceA0Response).toString())
            // const assetBalanceA0T4 = Number(assetBalanceA0T1)-Number(assetDeposit)+Number(assetWithdraw)
            // console.log("Depositor assets after withdraw (calculated): " + assetBalanceA0T3)
            // assert.equal((assetBalanceA0Response).toString(), assetBalanceA0T3)
            const assetBalanceLPT3 = await LongPool.totalAssets()
            console.log("Long Pool total asset: " + (assetBalanceLPT3).toString())
        })

        //     // 
        //     // const endingShareBalance = startingShareBalance+assetDeposit
        //     // assert.equal(responseShareBalance, Number(endingShareBalance))
    })
})