import deployed from '$/tools/hardhat/scripts/deployed.json'
import { App__factory, Profile__factory, type App, type Profile } from '$/tools/hardhat/typechain-types'
import { globalDialogManager } from "$lib/kicho-ui/components/KDialog.svelte"
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers"
import { ethers, type Signer } from "ethers"
import type { Writable } from 'svelte/store'
import { get, readable, writable } from 'svelte/store'
import { jsonProviders, jsonProvidersByChainId } from './providers'

const defaultProviderInfo = jsonProviders.Polygon

export function changeNetwork(network: keyof typeof jsonProviders)
{
    localStorage.setItem('wallet_chain-id-hex', JSON.stringify(jsonProviders[network].chainId))
    location.reload()
}
export const currentProviderInfo = jsonProvidersByChainId[JSON.parse(localStorage.getItem('wallet_chain-id-hex')) ?? defaultProviderInfo.chainId]

const state: Writable<'ready' | 'loading' | 'connecting' | 'notConnected' | 'wrongNetwork'> = writable('notConnected')
let account: string = null
let provider: Web3Provider | JsonRpcProvider = null

const web3Provider = (window as any).ethereum ? new ethers.providers.Web3Provider((window as any).ethereum) : null

export const wallet = {
    get provider() { return provider },
    get account() { return account },
    state: readable(get(state), (set) => state.subscribe((value) => set(value)))
}

export let appContract: App = null
export let profileContract: Profile = null

if (web3Provider)
{
    (window as any).ethereum.on('accountsChanged', () => location.reload());
    (window as any).ethereum.on('chainChanged', () => location.reload())
}

(async () =>
{
    account = web3Provider && (await web3Provider.listAccounts())[0]
    if (account)
    {
        state.set('connecting')
        provider = web3Provider
        await provider.ready
        await provider.send('eth_requestAccounts', [])
    }
    else
    {
        state.set('connecting')
        provider = new ethers.providers.JsonRpcProvider(currentProviderInfo.rpcUrls[0],
            {
                chainId: parseInt(currentProviderInfo.chainId, 16),
                name: currentProviderInfo.chainName
            })
        await provider.ready
    }

    state.set('loading')

    if (!(Object.values(jsonProviders)
        .some((info) => info.chainId === ethers.utils.hexlify(provider.network.chainId)) &&
        deployed[provider.network.chainId]?.['App'] &&
        deployed[provider.network.chainId]?.['Profile']))
    {
        state.set('wrongNetwork')
        throw 'Wrong Network'
    }

    const signer = provider instanceof Web3Provider ? provider.getSigner() : provider.getSigner('0x0000000000000000000000000000000000000000')
    appContract = App__factory.connect(deployed[provider.network.chainId]['App'], signer)
    profileContract = Profile__factory.connect(deployed[provider.network.chainId]['Profile'], signer)

    state.set('ready')
})()

export async function connectWallet()
{
    if (web3Provider) 
    {
        await web3Provider.send('eth_requestAccounts', [])
    }
    else 
    {
        await globalDialogManager.alert("No Web3 Wallet found on the browser.")
    }
}

export async function updateWalletNetwork()
{
    if (!web3Provider) return
    if (ethers.utils.hexlify(web3Provider.network.chainId) === currentProviderInfo.chainId) return

    try
    {
        await web3Provider.send(
            'wallet_switchEthereumChain',
            [{ chainId: currentProviderInfo.chainId }]
        )
    }
    catch (err)
    {
        // This error code indicates that the chain has not been added to MetaMask
        if (err.code === 4902)
        {
            await web3Provider.send(
                'wallet_addEthereumChain',
                [currentProviderInfo]
            )
        }
    }
}