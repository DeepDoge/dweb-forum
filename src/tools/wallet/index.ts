import { currentRoute } from '$/routes/_routing'
import deployed from '$/tools/hardhat/scripts/deployed.json'
import { globalDialogManager } from "$lib/kicho-ui/components/KDialog.svelte"
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers"
import { ethers } from "ethers"
import type { Writable } from 'svelte/store'
import { get, readable, writable } from 'svelte/store'
import { DefaultReverseResolver__factory, PostMetadata__factory, PostNFT__factory, PostResolver__factory, Posts__factory, Profile__factory } from '../hardhat/typechain-types'
import type { PostMetadata, PostNFT, PostResolver, Posts, Profile } from '../hardhat/typechain-types'
import { ReverseRegistrar__factory } from '../hardhat/typechain-types/factories/contracts/others/ens/ENSReverseResolve.sol'
import { type ChainOption, defaultChainOptions } from './chains'

export const NULL_ADDREESS = '0x0000000000000000000000000000000000000000'

export const chainOptions: readonly ChainOption[] = Object.freeze(Object.values(defaultChainOptions).filter((option) =>
    deployed[parseInt(option.chainId, 16)]
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
const web3Provider = (window as any).ethereum ? new ethers.providers.Web3Provider((window as any).ethereum) : null

const defaultChainId = defaultChainOptions.Polygon.chainId
if (!get(currentRoute).chainId) 
{
    location.replace(`#${web3Provider?.network?.chainId ?? parseInt(defaultChainId, 16)}`)
    location.reload()
}
export const currentChainOption = chainOptionsByChainId[ethers.utils.hexValue(get(currentRoute).chainId) ?? defaultChainId] ?? chainOptionsByChainId[defaultChainId]

let account: string = null
let provider: Web3Provider | JsonRpcProvider = null


export const ethProvider = new ethers.providers.JsonRpcProvider(
    defaultChainOptions.Ethereum.rpcUrls[0],
    {
        chainId: parseInt(defaultChainOptions.Ethereum.chainId, 16),
        name: defaultChainOptions.Ethereum.chainName,
        ensAddress: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
    }
)

export const wallet = {
    get provider() { return provider },
    web3Provider,
    get account() { return account },
    state: readable(get(state), (set) => state.subscribe((value) => set(value)))
}

const ethSigner = ethProvider.getSigner(NULL_ADDREESS)
export let ensReverseRecord = ReverseRegistrar__factory.connect('0x084b1c3C81545d370f3634392De611CaaBFf8148', ethSigner)
export let ensReverseResolver = DefaultReverseResolver__factory.connect('0xA2C122BE93b0074270ebeE7f6b7292C7deB45047', ethSigner)

export let postsContract: Posts = null
export let postMetadataContract: PostMetadata = null
export let postResolverContract: PostResolver = null
export let profileContract: Profile = null
export let postNftContract: PostNFT = null

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

        const signer = provider instanceof Web3Provider ? provider.getSigner() : provider.getSigner(NULL_ADDREESS)
        postsContract = Posts__factory.connect(deployed[provider.network.chainId]['Posts'], signer)
        postMetadataContract = PostMetadata__factory.connect(deployed[provider.network.chainId]['PostMetadata'], signer)
        postResolverContract = PostResolver__factory.connect(deployed[provider.network.chainId]['PostResolver'], signer)
        profileContract = Profile__factory.connect(deployed[provider.network.chainId]['Profile'], signer)
        postNftContract = PostNFT__factory.connect(deployed[provider.network.chainId]['PostNFT'], signer)

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

export async function changeWalletChain(chainId: string)
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
}

export function changeChain(chainId: string)
{
    if (!chainOptionsByChainId[chainId]) throw `No option for chain ${chainId} found.`
    location.assign(`#${parseInt(chainId, 16)}`)
}