import deployed from '$/plugins/hardhat/scripts/deployed.json'
import type { App } from '$/plugins/hardhat/typechain-types'
import { App__factory, Migrations__factory } from "$/plugins/hardhat/typechain-types"
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers"
import { ethers } from "ethers"
import { get } from 'svelte/store'
import type { Writable } from 'svelte/store'
import { writable } from 'svelte/store'

export const isContractsReady: Writable<boolean | 'wrongNetwork'> = writable(false)
export const provider: Writable<Web3Provider | JsonRpcProvider> = writable(null)
export const account: Writable<string> = writable(null)
export let appContract: App = null

const eth = (window as any).ethereum

account.subscribe((account) =>
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

        const signer = provider instanceof Web3Provider ? provider.getSigner() : provider.getSigner('0x0000000000000000000000000000000000000000')

        const migrationsContract = Migrations__factory.connect(contractAddress, signer)
        appContract?.removeAllListeners()
        appContract = App__factory.connect(await migrationsContract.lastVersionContractAddress(), signer)

        isContractsReady.set(true)
    })

    console.log(account)
    provider.set(
        account ?
            new ethers.providers.Web3Provider(eth) :
            new ethers.providers.JsonRpcProvider('https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161', { chainId: 4, name: 'rinkeby' })
    )
})

account.set(null)
if (eth)
{
    eth.request({ method: "eth_requestAccounts" }).then((addresses: string[]) => addresses[0] && account.set(addresses[0]))

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