require("hardhat-gas-reporter")
require("@nomiclabs/hardhat-etherscan")
require("solidity-coverage")
require("hardhat-deploy")
require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config()

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
/**
 * @type import('hardhat/config').HardhatUserConfig
 */

 const GOERLI_RPC_URL =
 process.env.GOERLI_RPC_URL ||
 "https://eth-mainnet.alchemyapi.io/v2/your-api-key"
const PRIVATE_KEY =
 process.env.PRIVATE_KEY ||
 "0x11ee3108a03081fe260ecdc106554d09d9d1209bcafd46942b10e02943effc4a"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || ""

module.exports = {
 defaultNetwork: "hardhat",
 networks: {
     hardhat: {
         chainId: 31337,
         blockConfirmations: 1,
         // gasPrice: 130000000000,
     },
     goerli: {
         url: GOERLI_RPC_URL,
         accounts: [PRIVATE_KEY],
         chainId: 5,
         blockConfirmations: 6,
     },
     localhost: {
         url: "http://127.0.0.1:8545/",
         chainId: 31337,
     }
 },
 solidity: {
     compilers: [{ version: "0.8.7" }, { version: "0.6.6" }],
 },
 etherscan: {
     apiKey: ETHERSCAN_API_KEY,
 },
 paths: {
    sources: "./contracts",
 },
 gasReporter: {
     enabled: true,
     currency: "USD",
     outputFile: "gas-report.txt",
     noColors: true,
     coinmarketcap: COINMARKETCAP_API_KEY,
     token: "ETH"
 },
 namedAccounts: {
     deployer: {
         default: 0, // by default take the first account as deployer
         1: 0,       // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
     },
 },
 mocha: {
     timeout: 500000,
 },
}
