import avalancheLogo from '$/assets/avalanche.svg'
import ethereumLogo from '$/assets/ethereum.svg'
import optimismLogo from '$/assets/optimism.svg'
import polygonImage from '$/assets/polygon.svg'
import { BigNumber, ethers } from "ethers"
import { deployedContracts } from './deployed'

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
        themeColor: '#627EEA',
        iconSrc: ethereumLogo
    }),
    EthereumClassic: createChainOption({
        chainName: 'Ethereum Classic',
        chainId: ethers.utils.hexValue(61),
        nativeCurrency: { name: 'ETC', decimals: 18, symbol: 'ETC' },
        rpcUrls: ['https://www.ethercluster.com/etc'],
        blockExplorerUrls: ['https://blockscout.com/etc/mainnet'],
        themeColor: '#457f38',
        iconSrc: ethereumLogo
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
        iconSrc: avalancheLogo
    }),
    Optimism: createChainOption({
        chainName: 'Optimism Mainnet',
        chainId: ethers.utils.hexValue(10),
        nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'ETH' },
        rpcUrls: ['https://mainnet.optimism.io'],
        blockExplorerUrls: ['https://optimistic.etherscan.io'],
        themeColor: '#ff0028',
        iconSrc: optimismLogo
    })
} as const)

export const chainOptions: readonly ChainOption[] = Object.freeze(Object.values(defaultChainOptions).filter((option) =>
    deployedContracts[parseInt(option.chainId, 16)]
).map((option) => ({
    ...option,
    rpcUrls: [localStorage.getItem(`custom-chain-${option.chainId}-rpc`) ?? option.rpcUrls[0]]
}))) as any

export const chainOptionsByChainId = Object.freeze(
    Object.fromEntries(
        chainOptions.map((info) => [info.chainId, info])
    )
)