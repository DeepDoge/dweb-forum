import deployed from '$/plugins/hardhat/scripts/deployed.json'
import type { App } from '$/plugins/hardhat/typechain-types'
import { App__factory, Migrations__factory } from "$/plugins/hardhat/typechain-types"
import type { Web3Provider } from "@ethersproject/providers"
import { ethers } from "ethers"
import type { Writable } from 'svelte/store'
import { writable } from 'svelte/store'

export const isContractsReady: Writable<boolean | 'wrongNetwork'> = writable(false)
export const provider: Writable<Web3Provider> = writable(null)
export const account: Writable<string> = writable(null)
export let appContract: App = null

const eth = (window as any).ethereum
if (eth)
{
    // use MetaMask's provider
    eth.request({ method: "eth_requestAccounts" }).then((addresses: string[]) => account.set(addresses[0])).then(() =>
    {
        provider.subscribe(async (provider) =>
        {
            isContractsReady.set(false)
            if (!provider) return
            await provider.ready
            let contractAddress: string = null
            let chainId = (await provider.getNetwork()).chainId

            if (!(contractAddress = deployed[chainId]?.['Migrations'] ?? null))
            {
                isContractsReady.set('wrongNetwork')
                throw new Error('Wrong Network')
            }

            const migrationsContract = Migrations__factory.connect(contractAddress, provider.getSigner())
            appContract?.removeAllListeners()
            appContract = App__factory.connect(await migrationsContract.lastVersionContractAddress(), provider.getSigner())

            isContractsReady.set(true)
        })
        provider.set(new ethers.providers.Web3Provider(eth))
    })

    // detect Metamask account change
    eth.on('accountsChanged', function (accounts: string[])
    {
        console.log('accountsChanges', accounts)
        account.set(accounts[0])
    })

    // detect Network account change
    eth.on('chainChanged', function (networkId: number)
    {
        console.log('chainChanged', networkId)
        provider.set(new ethers.providers.Web3Provider(eth))
    })
}

