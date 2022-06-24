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

isContractsReady.subscribe((value) => console.log('content ready', value))

const eth = (window as any).ethereum

export async function changeNetwork(targetChainId: number)
{
    if (eth.networkVersion !== targetChainId)
    {
        try
        {
            await eth.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: ethers.utils.hexlify(targetChainId) }]
            });
        }
        catch (err)
        {
            // This error code indicates that the chain has not been added to MetaMask
            if (err.code === 4902)
            {
                await eth.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainName: 'Polygon Mainnet',
                            chainId: ethers.utils.hexlify(targetChainId),
                            nativeCurrency: { name: 'MATIC', decimals: 18, symbol: 'MATIC' },
                            rpcUrls: ['https://polygon-rpc.com/'],
                            blockExplorerUrls: ['https://polygonscan.com/']
                        }
                    ]
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
            new ethers.providers.JsonRpcProvider('https://polygon-rpc.com', { chainId: 137, name: 'polygon' })
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