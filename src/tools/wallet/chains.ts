import { BigNumber, ethers } from "ethers"
import ethereumImage from '$/assets/ethereum.svg'
import polygonImage from '$/assets/polygon.svg'
import avalancheImage from '$/assets/avalanche.svg'
import optimismImage from '$/assets/optimism.svg'

export interface JsonRpcProviderConfig
{
    chainName: string,
    chainId: string,
    nativeCurrency: { name: string, decimals: number, symbol: string },
    rpcUrls: string[],
    blockExplorerUrls: string[]
}

export interface ChainOption extends JsonRpcProviderConfig
{
    themeColor: string
    iconSrc: string
}

function createChainOption<T extends ChainOption>(value: T)
{
    return value
}

(window as any).BigNumber = BigNumber

export const defaultChainOptions = Object.freeze({
    Ethereum: createChainOption({
        chainName: 'Ethereum Mainnet',
        chainId: ethers.utils.hexValue(1),
        nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'ETH' },
        rpcUrls: ['https://cloudflare-eth.com'],
        blockExplorerUrls: ['https://etherscan.io'],
        themeColor: '#647ae7',
        iconSrc: ethereumImage
    }),
    Polygon: createChainOption({
        chainName: 'Polygon Mainnet',
        chainId: ethers.utils.hexValue(137),
        nativeCurrency: { name: 'MATIC', decimals: 18, symbol: 'MATIC' },
        rpcUrls: ['https://polygon-rpc.com'],
        blockExplorerUrls: ['https://polygonscan.com'],
        themeColor: '#853be2',
        iconSrc: polygonImage
    }),
    Avalanche: createChainOption({
        chainName: 'Avalanche C-Chain',
        chainId: ethers.utils.hexValue(43114),
        nativeCurrency: { name: "AVAX", decimals: 18, symbol: 'AVAX' },
        rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
        blockExplorerUrls: ['https://cchain.explorer.avax.network/'],
        themeColor: '#d74b4c',
        iconSrc: avalancheImage
    }),
    Optimism: createChainOption({
        chainName: 'Optimism Mainnet',
        chainId: ethers.utils.hexValue(10),
        nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'ETH' },
        rpcUrls: ['https://mainnet.optimism.io'],
        blockExplorerUrls: ['https://optimistic.etherscan.io'],
        themeColor: '#ff0028',
        iconSrc: optimismImage
    }) 
} as const)