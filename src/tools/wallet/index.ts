import { currentRoute } from '$/routes/_routing'
import { globalDialogManager } from "$lib/kicho-ui/components/KDialog.svelte"
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers"
import { ethers } from "ethers"
import { get } from 'svelte/store'
import type { PostMetadata, PostNFT, PostResolver, Posts, Profile } from '../hardhat/typechain-types'
import { PostMetadata__factory, PostNFT__factory, PostResolver__factory, Posts__factory, Profile__factory } from '../hardhat/typechain-types'
import { chainOptionsByChainId, defaultChainOptions } from './chains'
import { NULL_ADDREESS } from './common'
import { deployedContracts } from './deployed'

const web3Provider = (window as any).ethereum ? new ethers.providers.Web3Provider((window as any).ethereum) : null

const defaultChainId = defaultChainOptions.Polygon.chainId
if (!get(currentRoute).chainId) 
{
    location.replace(`#${web3Provider?.network?.chainId ?? parseInt(defaultChainId, 16)}`)
    location.reload()
}
const currentChainOption = chainOptionsByChainId[ethers.utils.hexValue(get(currentRoute).chainId) ?? defaultChainId] ?? chainOptionsByChainId[defaultChainId]


export const wallet = service('Web3', {
    'connecting-contracts': "Connecting Contracts...",
    'connecting-network': 'Connecting Network...',
    'not-connected': 'Not Connected',
    'wrong-network': 'Wrong Network',
    'ready': 'Ready'
}, (setState) =>
{
    setState('connecting-network')

    let account: string = null
    let provider: Web3Provider | JsonRpcProvider = null

    let postsContract: Posts = null
    let postMetadataContract: PostMetadata = null
    let postResolverContract: PostResolver = null
    let profileContract: Profile = null
    let postNftContract: PostNFT = null

    const wallet = {
        get provider() { return provider },
        get web3Provider() { return web3Provider },
        get account() { return account },
        get currentChainOption() { return currentChainOption },
        contracts: {
            postsContract,
            postMetadataContract,
            postResolverContract,
            profileContract,
            postNftContract
        }
    };

    (async () =>
    {
        if (!currentChainOption)
        {
            setState("wrong-network")
        }
        else
        {
            account = web3Provider && (await web3Provider.listAccounts())[0]
            if (account)
            {
                setState('connecting-network')
                provider = web3Provider
                await provider.ready
                await provider.send('eth_requestAccounts', [])
            }
            else
            {
                setState('connecting-network')
                provider = new ethers.providers.JsonRpcProvider(currentChainOption.rpcUrls[0],
                    {
                        chainId: parseInt(currentChainOption.chainId, 16),
                        name: currentChainOption.chainName
                    })
                await provider.ready
            }

            if (!(currentChainOption.chainId === ethers.utils.hexValue(provider.network.chainId)))
            {
                setState('wrong-network')
                throw 'Wrong Network'
            }

            setState('connecting-contracts')

            const signer = provider instanceof Web3Provider ? provider.getSigner() : provider.getSigner(NULL_ADDREESS)
            postsContract = Posts__factory.connect(deployedContracts[provider.network.chainId]['Posts'], signer)
            postMetadataContract = PostMetadata__factory.connect(deployedContracts[provider.network.chainId]['PostMetadata'], signer)
            postResolverContract = PostResolver__factory.connect(deployedContracts[provider.network.chainId]['PostResolver'], signer)
            profileContract = Profile__factory.connect(deployedContracts[provider.network.chainId]['Profile'], signer)
            postNftContract = PostNFT__factory.connect(deployedContracts[provider.network.chainId]['PostNFT'], signer)

            wallet.contracts = Object.freeze({
                postsContract,
                postMetadataContract,
                postResolverContract,
                profileContract,
                postNftContract
            })

            setState('ready')
        }
    })()

    return wallet
})

export const walletState = wallet.state

if (web3Provider)
{
    (window as any).ethereum.on('accountsChanged', () => location.reload());
    (window as any).ethereum.on('chainChanged', () => location.reload())
}

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
    if (wallet.service.account)
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

import { readable, type Readable } from "svelte/store"

export interface ServiceState
{
    type: string
    text: string
}

export interface Service<S>
{
    service: S
    state: Readable<ServiceState>
}

export type StateSetter<States extends Record<string, string>> = (state: Extract<keyof States, string>) => void
export type ServiceLoader<S, States extends Record<string, string>> = (setState: StateSetter<States>) => S

export function service<S, States extends Record<string, string>>(name: string, states: States, loader: ServiceLoader<S, States>): Readonly<Service<S>>
{
    const service: Service<S> = {
        service: null,
        state: readable<ServiceState>(null, (set) =>
        {
            try
            {
                service.service = loader((state: Extract<keyof States, string>) => set({
                    type: state,
                    text: `${name}: ${states[state]}`
                }))
            }
            catch (error)
            {
                console.error(error)
            }
        })
    }

    return service
}