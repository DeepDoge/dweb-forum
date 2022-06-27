// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import fs from 'fs'
import { ethers } from "hardhat"
import path from 'path'


type chainId = string
type contractName = string
type contracyAddress = string
type Deployed = Record<chainId, Record<contractName, contracyAddress>>

async function main()
{
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  await ethers.provider.ready
  const chainId = ethers.provider.network?.chainId ?? 0
  const deployedJsonPath = path.join(__dirname, 'deployed.json')
  const deployed: Deployed = require(deployedJsonPath) ?? {}
  if (!deployed[chainId]) deployed[chainId] = {}

  function setAsDeployed(name: string, address: string)
  {
    if (getAddressIfDeployed(name) === address)
    {
      console.log(`${name} is already deployed at: ${address}`)
      return
    }
    Object.assign(deployed[chainId], { [name]: address })
    fs.writeFileSync(deployedJsonPath, JSON.stringify(deployed, null, '\t'))
    console.log(`${name} deployed to: ${address}`)
  }

  function getAddressIfDeployed(name: string)
  {
    return deployed[chainId][name]
  }

  async function deployContract(name: string)
  {
    console.log(`Getting factory ${name}`)
    const Contract = await ethers.getContractFactory(name)
    console.log(`Deploying ${name}`)
    const contract = await Contract.deploy()

    await contract.deployed()
    setAsDeployed(name, contract.address)
  }

  await deployContract('App')
  // await deployContract('Profile')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) =>
{
  console.error(error)
  process.exitCode = 1
})
