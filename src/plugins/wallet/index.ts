import deployed from '$/plugins/hardhat/scripts/deployed.json'
import type { App, Profile } from '$/plugins/hardhat/typechain-types'
import { App__factory, Profile__factory } from "$/plugins/hardhat/typechain-types"
import { globalDialogManager } from '$lib/kicho-ui/dialog'
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers"
import { ethers } from "ethers"
import type { Writable } from 'svelte/store'
import { get, readable, writable } from 'svelte/store'
import { asyncFunctionQueue } from '../utils/asyncFunctionQueue'
import { hexToUtf8 } from '../utils/bytes'

const eth = (window as any).ethereum

export const isContractsReady: Writable<boolean | 'wrongNetwork'> = writable(false)
export const provider: Writable<Web3Provider | JsonRpcProvider> = writable(null)
export const account: Writable<string> = writable('loading')
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
            chainName: 'Polygon(MATIC)',
            chainId: ethers.utils.hexlify(137),
            nativeCurrency: { name: 'MATIC', decimals: 18, symbol: 'MATIC' },
            rpcUrls: ['https://polygon-rpc.com'],
            blockExplorerUrls: ['https://polygonscan.com']
        }),
        LocalHost: createJsonRpcProviderInfo({
            chainName: 'Localhost',
            chainId: ethers.utils.hexlify(1337),
            nativeCurrency: { name: 'Fake ETH', decimals: 18, symbol: 'Fake ETH' },
            rpcUrls: ['http://localhost:8545'],
            blockExplorerUrls: []
        }),
        Ethereum: createJsonRpcProviderInfo({
            chainName: 'Ethereum Mainnet',
            chainId: ethers.utils.hexlify(1),
            nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'ETH' },
            rpcUrls: ['https://cloudflare-eth.com'],
            blockExplorerUrls: ['https://etherscan.io']
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
        console.log(target)
        try
        {
            await eth.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: target.chainId }]
            });
        }
        catch (err)
        {
            // This error code indicates that the chain has not been added to MetaMask
            if (err.code === 4902)
            {
                await eth.request({
                    method: 'wallet_addEthereumChain',
                    params: [target]
                });
            }
        }
    }
}

const providerChange = asyncFunctionQueue(async (provider: Web3Provider | JsonRpcProvider) =>
{
    console.log('update', provider)
    isContractsReady.set(false)
    if (!provider) return
    await provider.ready
    let contractAddress: string = null
    let chainId = (await provider.getNetwork()).chainId

    console.log(chainId, provider)

/*     if (provider instanceof Web3Provider)
        console.log(':)', await provider.lookupAddress('0xE272C9a263701DAFFe940FB4ecEACFa9b2c1217D')) */

    if (!(contractAddress = deployed[chainId]?.['App'] ?? null))
    {
        isContractsReady.set('wrongNetwork')
        throw new Error('Wrong Network')
    }

    const signer = provider instanceof Web3Provider ? provider.getSigner() : provider.getSigner('0x0000000000000000000000000000000000000000')

    appContract?.removeAllListeners()
    appContract = App__factory.connect(contractAddress, signer)

    profileContract?.removeAllListeners()
    profileContract = Profile__factory.connect(deployed[chainId]['Profile'], signer)

    isContractsReady.set(true)
})
provider.subscribe((value) => providerChange.call(value))

account.subscribe((account) =>
{
    if (account === 'loading') return
    const providerInfo = get(currentProviderInfo)
    provider.set(
        account ?
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