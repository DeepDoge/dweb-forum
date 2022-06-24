import deployed from '$/plugins/hardhat/scripts/deployed.json'
import type { App } from '$/plugins/hardhat/typechain-types'
import { App__factory } from "$/plugins/hardhat/typechain-types"
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers"
import { ethers } from "ethers"
import type { Writable } from 'svelte/store'
import { get, writable } from 'svelte/store'
import { asyncFunctionQueue } from '../common/asyncFunctionQueue'

export const isContractsReady: Writable<boolean | 'wrongNetwork'> = writable(false)
export const provider: Writable<Web3Provider | JsonRpcProvider> = writable(null)
export const account: Writable<string> = writable(null)
export let appContract: App = null

const eth = (window as any).ethereum

const providerChange = asyncFunctionQueue(async (provider: Web3Provider | JsonRpcProvider) =>
{
    isContractsReady.set(false)
    if (!provider) return
    await provider.ready
    let contractAddress: string = null
    let chainId = (await provider.getNetwork()).chainId

    console.log(chainId, provider)

    if (!(contractAddress = deployed[chainId]?.['App'] ?? null))
    {
        isContractsReady.set('wrongNetwork')
        throw new Error('Wrong Network')
    }

    const signer = provider instanceof Web3Provider ? provider.getSigner() : provider.getSigner('0x0000000000000000000000000000000000000000')

    appContract?.removeAllListeners()
    appContract = App__factory.connect(contractAddress, signer)

    isContractsReady.set(true)
})
provider.subscribe((value) => providerChange.call(value))

account.subscribe((account) =>
{
    provider.set(
        account ?
            new ethers.providers.Web3Provider(eth) :
            new ethers.providers.JsonRpcProvider('https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161', { chainId: 4, name: 'rinkeby' })
    )
})

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
        if (get(provider) instanceof Web3Provider) provider.set(new ethers.providers.Web3Provider(eth))
    })
}