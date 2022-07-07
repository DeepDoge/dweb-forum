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
  solidity: "0.8.4",
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
    }
  }
}

export default config