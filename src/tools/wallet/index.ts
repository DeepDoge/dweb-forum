import deployed from '$/tools/hardhat/scripts/deployed.json'
import { App__factory, Profile__factory, type App, type Profile } from '$/tools/hardhat/typechain-types'
import { promiseQueue } from '$/utils/common/promiseQueue'
import { globalDialogManager } from "$lib/kicho-ui/components/KDialog.svelte";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers"
import { ethers } from "ethers"
import type { Writable } from 'svelte/store'
import { get, readable, writable } from 'svelte/store'

const eth = (window as any).ethereum

export const isContractsReady: Writable<boolean | 'wrongNetwork'> = writable(false)
export const provider: Writable<Web3Provider | JsonRpcProvider> = writable(null)
export const account: Writable<string> = writable(null)
export let appContract: App = null
export let profileContract: Profile = null

export interface JsonRpcProviderInfo
{
    chainName: string,
    chainId: string,
    nativeCurrency: { name: string, decimals: number, symbol: string },
    rpcUrls: string[],
    blockExplorerUrls: string[]
}

function createJsonRpcProviderInfo(value: JsonRpcProviderInfo)
{
    return value
}

export const jsonProviders =
    Object.freeze({
        Polygon: createJsonRpcProviderInfo({
            chainName: 'Polygon Mainnet',
            chainId: ethers.utils.hexlify(137),
            nativeCurrency: { name: 'MATIC', decimals: 18, symbol: 'MATIC' },
            rpcUrls: ['https://polygon-rpc.com'],
            blockExplorerUrls: ['https://polygonscan.com']
        }),
        LocalHost: createJsonRpcProviderInfo({
            chainName: 'Localhost',
            chainId: ethers.utils.hexlify(1337),
            nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'ETH' },
            rpcUrls: ['http://localhost:8545'],
            blockExplorerUrls: null
        }),
        Ethereum: createJsonRpcProviderInfo({
            chainName: 'Ethereum Mainnet',
            chainId: ethers.utils.hexlify(1),
            nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'ETH' },
            rpcUrls: ['https://cloudflare-eth.com'],
            blockExplorerUrls: ['https://etherscan.io']
        }),
        Optimism: createJsonRpcProviderInfo({
            chainName: 'Optimism Mainnet',
            chainId: ethers.utils.hexlify(10),
            nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'ETH' },
            rpcUrls: ['https://mainnet.optimism.io'],
            blockExplorerUrls: ['https://optimistic.etherscan.io']
        }),
        Arbitrum: createJsonRpcProviderInfo({
            chainName: 'Arbitrum One',
            chainId: ethers.utils.hexlify(42161),
            nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'ETH' },
            rpcUrls: ['https://arb1.arbitrum.io/rpc'],
            blockExplorerUrls: ['https://arbiscan.io/']
        }),
        Avalanche: createJsonRpcProviderInfo({
            chainName: 'Avalanche C-Chain',
            chainId: ethers.utils.hexlify(43114),
            nativeCurrency: { name: "AVAX", decimals: 18, symbol: 'AVAX' },
            rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
            blockExplorerUrls: ['https://cchain.explorer.avax.network/']
        })
    } as const)

export const currentProviderInfo = writable(jsonProviders.Polygon)
export const ethereumProviderInfo = writable(jsonProviders.Ethereum)
export const ethereumJsonRpcProvider = readable<JsonRpcProvider>(
    null,
    (set) => ethereumProviderInfo.subscribe((value) => set(
        new ethers.providers.JsonRpcProvider(value.rpcUrls[0],
            {
                chainId: parseInt(value.chainId, 16),
                name: value.chainName
            }
        )
    ))
)

export async function changeNetwork(target: JsonRpcProviderInfo)
{
    if (ethers.utils.hexlify(parseInt(eth.networkVersion)) !== target.chainId)
    {
        try
        {
            await eth.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: target.chainId }]
            })
        }
        catch (err)
        {
            // This error code indicates that the chain has not been added to MetaMask
            if (err.code === 4902)
            {
                await eth.request({
                    method: 'wallet_addEthereumChain',
                    params: [target]
                })
            }
        }
    }
}

const providerChange = promiseQueue(async (provider: Web3Provider | JsonRpcProvider) =>
{
    isContractsReady.set(false)
    if (!provider) return
    await provider.ready
    console.log(`Using ${provider instanceof Web3Provider ? 'Web3' : 'JsonRpc'} provider ${provider.network.chainId}(${provider.network.name})`)
    let chainId = (await provider.getNetwork()).chainId

    if (ethers.utils.hexlify(chainId) !== get(currentProviderInfo).chainId)
    {
        isContractsReady.set('wrongNetwork')
        throw new Error('Wrong Network')
    }

    const signer = provider instanceof Web3Provider ? provider.getSigner() : provider.getSigner('0x0000000000000000000000000000000000000000')

    appContract?.removeAllListeners()
    appContract = App__factory.connect(deployed[chainId]?.['App'], signer)

    profileContract?.removeAllListeners()
    profileContract = Profile__factory.connect(deployed[chainId]['Profile'], signer)

    isContractsReady.set(true)
})
provider.subscribe((value) => providerChange(value))

account.subscribe((account) =>
{
    const providerInfo = get(currentProviderInfo)
    provider.set(
        account || providerInfo === jsonProviders.LocalHost ?
            new ethers.providers.Web3Provider(eth) :
            new ethers.providers.JsonRpcProvider(providerInfo.rpcUrls[0],
                {
                    chainId: parseInt(providerInfo.chainId, 16),
                    name: providerInfo.chainName
                }
            )
    )
})

export async function connectWallet()
{
    if (eth)
        await eth.request({ method: "eth_requestAccounts" }).then((addresses: string[]) => addresses[0] && account.set(addresses[0]))
    else await globalDialogManager.alert("No Web3 Wallet found on the browser.")
}

if (eth)
{
    connectWallet()

    // detect Metamask account change
    eth.on('accountsChanged', function (accounts: string[])
    {
        console.log(`Web3 wallet account changed to ${accounts[0]}`)
        account.set(accounts[0])
    })

    // detect Network account change
    eth.on('chainChanged', function (networkId: number)
    {
        console.log(`Web3 wallet changed network to ${networkId}`)
        if (get(provider) instanceof Web3Provider) provider.set(new ethers.providers.Web3Provider(eth))
    })
}