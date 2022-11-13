const { network, ethers } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log , execute} = deployments
    const { deployer } = await getNamedAccounts()
    // const chainId = network.config.chainId

    log("----------------------------------------------------")
    log("Deploying ERC20.sol and waiting for confirmations...")
    const argsERC20 = ["BaseToken", "BTK", 100]
    const Erc20 = await deploy("ERC20", {
        from: deployer,
        args: argsERC20,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log(`ERC20.sol deployed at ${Erc20.address}`)

    log("----------------------------------------------------")
    log("Deploying LongPool.sol, waiting for confirmations...")
    const argsLongPool = [Erc20.address]
    const longPool = await deploy("LongPool", {
        from: deployer,
        args: argsLongPool,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log(`LongPool.sol (long) deployed at ${longPool.address}`)

    log("----------------------------------------------------")
    log("Deploying ShortPool.sol and waiting for confirmations...")
    const argsShortPool = [Erc20.address]
    const shortPool = await deploy("ShortPool", {
        from: deployer,
        args: argsShortPool,    
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log(`Pool.sol (short) deployed at ${shortPool.address}`)

    // cross records short and long pool addresses
    await execute("LongPool", {
        from: deployer,
        log: true,
    },
    "recordShortPoolAddress",
    shortPool.address
    )

    await execute("ShortPool", {
        from: deployer,
        log: true,
    },
    "recordLongPoolAddress",
    longPool.address
    )

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(Erc20.address, argsERC20)
        await verify(longPool.address, argsLongPool)
        await verify(shortPool.address, argsShortPool)
        await verify(balancer.address, [Erc20.address])
    }
}

module.exports.tags = ["all", "erc20", "erc4626"]



// sets short pool address in long pool contract
    // await execute("Erc4626Long",
    // {
    //     from: deployer,
    //     log: true,
    // },
    // "setOppositePoolAddress",
    // Erc4626Short.address
    // )

    // // sets long pool address in short pool contract
    // await execute("ERC4626Short", {
    //     from: deployer,
    //     log: true,
    // },
    // "setOppositePoolAddress",
    // Erc4626Long.address
    // )

    // console.log(network.config)