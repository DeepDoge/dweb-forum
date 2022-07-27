import deployed from '$/tools/hardhat/scripts/deployed.json'
import { App__factory, DefaultReverseResolver__factory, Profile__factory, ReverseRegistrar__factory, type App, type Profile } from '$/tools/hardhat/typechain-types'
import { globalDialogManager } from "$lib/kicho-ui/components/KDialog.svelte"
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers"
import { ethers } from "ethers"
import type { Writable } from 'svelte/store'
import { get, readable, writable } from 'svelte/store'
import { type ChainOption, defaultChainOptions } from './chains'

export const chainOptions: readonly ChainOption[] = Object.freeze(Object.values(defaultChainOptions).filter((option) =>
    deployed[parseInt(option.chainId, 16)]?.App &&
    deployed[parseInt(option.chainId, 16)]?.Profile
).map((option) => ({
    ...option,
    rpcUrls: [localStorage.getItem(`custom-chain-${option.chainId}-rpc`) ?? option.rpcUrls[0]]
}))) as any

export const chainOptionsByChainId = Object.freeze(
    Object.fromEntries(
        chainOptions.map((info) => [info.chainId, info])
    )
)

const state: Writable<'ready' | 'loading' | 'connecting' | 'notConnected' | 'wrongNetwork'> = writable('notConnected')

const defaultChainId = defaultChainOptions.Polygon.chainId
export const currentChainOption = chainOptionsByChainId[JSON.parse(localStorage.getItem('wallet_chain-id-hex')) ?? defaultChainId] ?? chainOptionsByChainId[defaultChainId]

let account: string = null
let provider: Web3Provider | JsonRpcProvider = null

const web3Provider = (window as any).ethereum ? new ethers.providers.Web3Provider((window as any).ethereum) : null
const ethProvider = new ethers.providers.JsonRpcProvider(
    defaultChainOptions.Ethereum.rpcUrls[0],
    {
        chainId: parseInt(defaultChainOptions.Ethereum.chainId, 16),
        name: defaultChainOptions.Ethereum.chainName
    }
)

export const wallet = {
    get provider() { return provider },
    web3Provider,
    get account() { return account },
    state: readable(get(state), (set) => state.subscribe((value) => set(value)))
}

export let appContract: App = null
export let profileContract: Profile = null
const ethSigner = ethProvider.getSigner("0x0000000000000000000000000000000000000000")
export let ensReverseRecord = ReverseRegistrar__factory.connect('0x084b1c3C81545d370f3634392De611CaaBFf8148', ethSigner)
export let ensReverseResolver = DefaultReverseResolver__factory.connect('0xA2C122BE93b0074270ebeE7f6b7292C7deB45047', ethSigner)

if (web3Provider)
{
    (window as any).ethereum.on('accountsChanged', () => location.reload());
    (window as any).ethereum.on('chainChanged', () => location.reload())
}

if (!currentChainOption)
{
    state.set("wrongNetwork")
}
else
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
            provider = new ethers.providers.JsonRpcProvider(currentChainOption.rpcUrls[0],
                {
                    chainId: parseInt(currentChainOption.chainId, 16),
                    name: currentChainOption.chainName
                })
            await provider.ready
        }

        state.set('loading')

        if (!(currentChainOption.chainId === ethers.utils.hexValue(provider.network.chainId)))
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

export async function changeNetwork(chainId: string)
{
    if (account)
    {
        try
        {
            await web3Provider.send(
                'wallet_switchEthereumChain',
                [{ chainId }]
            )
        }
        catch (err)
        {
            // This error code indicates that the chain has not been added to MetaMask
            if (err.code === 4902)
            {
                await web3Provider.send(
                    'wallet_addEthereumChain',
                    [chainOptionsByChainId[chainId]]
                )
            }
            else throw ""
        }
    }

    if (!chainOptionsByChainId[chainId]) throw `No option for chain ${chainId} found.`
    localStorage.setItem('wallet_chain-id-hex', JSON.stringify(chainId))

    location.reload()
}