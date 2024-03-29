import "@nomiclabs/hardhat-ethers"
import "@typechain/hardhat"
import { HardhatUserConfig, task } from "hardhat/config"
const secrets = require('./chain-secrets.json')
// import secret from './chain-secrets.json'

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) =>
{
  const accounts = await hre.ethers.getSigners()
  for (const account of accounts)
  {
    console.log(account.address)
  }
})

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      { version: '0.8.15' },
      { version: '0.5.0' },
      { version: '0.4.25' }
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      }
    }
  },
  networks: {
    localhost: {
      url: "http://172.17.0.1:8545"
    },
    hardhat: {

    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${secrets.projectId}`,
      accounts: [secrets.privateKey]
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${secrets.projectId}`,
      accounts: [secrets.privateKey]
    },
    polygon: {
      url: `https://polygon-rpc.com/`,
      accounts: [secrets.privateKey]
    },
    classic: {
      url: `https://www.ethercluster.com/etc`,
      accounts: [secrets.privateKey]
    },
    optimism: {
      url: 'https://mainnet.optimism.io',
      accounts: [secrets.privateKey]
    },
    arbitrum: {
      url: 'https://arb1.arbitrum.io/rpc',
      accounts: [secrets.privateKey]
    },
    avalanche: {
      url: 'https://api.avax.network/ext/bc/C/rpc',
      gasPrice: 225000000000,
      chainId: 43114,
      accounts: [secrets.privateKey]
    }
  }
}

export default config