# Elastic Futures

This note presents an innovative financial arrangement allowing traders to take leveraged long and short positions against each others. Positions have a common forward price as in futures contracts but no preset duration. The price range over which leverage tokens are traded broadens when winning traders take their profit, which extends the life-time of the futures. When the price eventually exits the trading interval, the contract freezes and enters a settlement phase. See more detailed [presentation](https://hackmd.io/@pre-vert/elastic_non_technical).

## Functionning

Two permissionless pools, a long pool and a short pool, are collateralized by users who seek leveraged long or short positions. The two pools echange PNL when users deposit or withdraw their funds.

## Architecture

The protocol re-uses ERC20 and ERC4626 Openzeppelin contracts:

            ERC20 contract
                   |
            ERC4626 contract
              |           |
          Short pool   Long pool
               \          /
                 Computer

Computer calculates PNL exchanged between the two pools.