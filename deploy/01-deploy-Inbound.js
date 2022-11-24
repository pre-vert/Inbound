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

    log("----------------------------------------------------")
    log("Deploying Computer.sol, waiting for confirmations...")
    const argsComputer = [Erc20.address, longPool.address, shortPool.address, 100, 3]
    const computer = await deploy("Computer", {
        from: deployer,
        args: argsComputer,    
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log(`Rebalancer.sol deployed at ${computer.address}`)

    log("----------------------------------------------------")
    log("Setting pool and computer addresses...")

    await execute("LongPool", {
        from: deployer,
        log: true,
    },
    "setShortPoolAddress",
    shortPool.address
    )

    await execute("ShortPool", {
        from: deployer,
        log: true,
    },
    "setLongPoolAddress",
    longPool.address
    )

    await execute("LongPool", {
        from: deployer,
        log: true,
    },
    "setComputerAddress",
    computer.address
    )

    await execute("ShortPool", {
        from: deployer,
        log: true,
    },
    "setComputerAddress",
    computer.address
    )

    if (!developmentChains.includes(network.name)
    ) {
        log("----------------------------------------------------")
        log("Approves 30 in long pool")
    
        await execute("ERC20", {
            from: deployer, log: true
            },
            "approve",
            longPool.address, 30
        )

        log("----------------------------------------------------")
        log("Deposits 30 in long pool")
        await execute("LongPool", {
            from: deployer, log: true
            },
            "deposit",
            30, deployer
        )

        log("----------------------------------------------------")
        log("Approves 30 in short pool")
    
        await execute("ERC20", {
            from: deployer, log: true
            },
            "approve",
            shortPool.address, 30
        )

        log("----------------------------------------------------")
        log("Deposits 30 in short pool")

        await execute("ShortPool", {
            from: deployer, log: true
            },
            "deposit",
            30, deployer
        )
    }

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(Erc20.address, argsERC20)
        await verify(longPool.address, argsLongPool)
        await verify(shortPool.address, argsShortPool)
        await verify(computer.address, argsComputer)
    }
}

module.exports.tags = ["all", "erc20", "erc4626"]
