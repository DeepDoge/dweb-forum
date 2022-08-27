import { DefaultReverseResolver__factory, ReverseRegistrar__factory } from "$/tools/hardhat/typechain-types"
import { defaultChainOptions } from "$/tools/wallet/chains"
import { NULL_ADDREESS } from "$/tools/wallet/common"
import { hexToUtf8, utf8AsBytes32 } from "$/utils/bytes"
import { createPromiseResultCacher, createTempStore } from "$/utils/common/store"
import { ethers } from "ethers"
import { writable, type Writable } from "svelte/store"
import type { TypedListener } from "../tools/hardhat/typechain-types/common"
import type { ProfileSetEvent } from "../tools/hardhat/typechain-types/contracts/Profile"
import { wallet } from "../tools/wallet"

export interface ProfileInfo
{
    value: Writable<string>
    listen(): void
    unlisten(): void
}

const ethProvider = new ethers.providers.JsonRpcProvider(
    defaultChainOptions.Ethereum.rpcUrls[0],
    {
        chainId: parseInt(defaultChainOptions.Ethereum.chainId, 16),
        name: defaultChainOptions.Ethereum.chainName,
        ensAddress: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
    }
)
const ethSigner = ethProvider.getSigner(NULL_ADDREESS)
const ensReverseRecord = ReverseRegistrar__factory.connect('0x084b1c3C81545d370f3634392De611CaaBFf8148', ethSigner)
const ensReverseResolver = DefaultReverseResolver__factory.connect('0xA2C122BE93b0074270ebeE7f6b7292C7deB45047', ethSigner)

const listeners: Record<string, { count: number, unlisten: () => void }> = {}
const profileDataCacher = createPromiseResultCacher()
export async function getProfileData(address: string, key: string)
{
    const uniqueKey = `${address}:${key}`
    return await profileDataCacher.cache(uniqueKey, async () =>
    {
        const result = writable(hexToUtf8(await wallet.service.contracts.profileContract.profiles(address, utf8AsBytes32(key))))

        function listen()
        {
            const filter = wallet.service.contracts.profileContract.filters.ProfileSet(address, utf8AsBytes32(key))
            const listener: TypedListener<ProfileSetEvent> = (owner, key, value, timestamp) => result.set(hexToUtf8(value))
            wallet.service.contracts.profileContract.on(filter, listener)

            if (listeners[uniqueKey]) listeners[uniqueKey].count++
            else listeners[uniqueKey] = {
                count: 1, unlisten() { wallet.service.contracts.profileContract.off(filter, listener) }
            }
        }

        function unlisten()
        {
            const listener = listeners[uniqueKey]
            if (listener && --listener.count === 0) listener.unlisten()
            if (listener?.count < 0) throw "Listener count is lower than 0, this is not suppose to happen."
        }

        return {
            value: result,
            listen,
            unlisten,
        }
    })
}

const ensNameStore = createTempStore<{ ensName: string }>('ens-name', 1000 * 60 * 5)
const ensNameCacher = createPromiseResultCacher()
export async function ensNameOf(address: string)
{
    const key = address.toLowerCase()
    return await ensNameCacher.cache(key, async () => 
    {
        const cache = await ensNameStore.get(key)
        if (cache) return cache.ensName

        const response = await ensReverseResolver.name(await ensReverseRecord.node(address))
        if (response) await ensNameStore.put(key, { ensName: response })
        return response
    })
}

const ensAddressStore = createTempStore<{ address: string }>('ens-address', 1000 * 60 * 5)
const ensAddressCacher = createPromiseResultCacher()
export async function ensResolve(ensName: string)
{
    const key = ensName.toLowerCase()
    return await ensAddressCacher.cache(key, async () => 
    {
        const cache = await ensAddressStore.get(key)
        if (cache) return cache.address

        const response = await (await ethProvider.getResolver(ensName)).getAddress()
        if (response) await ensAddressStore.put(key, { address: response })
        return response
    })
}