import { ethers } from "ethers"

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

export const jsonProvidersByChainId = Object.freeze(Object.fromEntries(Object.values(jsonProviders).map((info) => [info.chainId, info])))