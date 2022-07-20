import { profileContract } from "$/tools/wallet"
import { listenContract } from "$/tools/wallet/listen"
import { hexToUtf8, utf8AsBytes32 } from "$/utils/bytes"
import { createPromiseResultCacher, createTempStore } from "$/utils/common/store"
import { getDefaultProvider } from "ethers"
import { writable, type Writable } from "svelte/store"

export interface ProfileInfo
{
    value: Writable<string>
    listen(): void
    unlisten(): void
}

const listeners: Record<string, { count: number, unlisten: () => void }> = {}
const profileDataCacher = createPromiseResultCacher()
export async function getProfileData(address: string, key: string)
{
    const uniqueKey = `${address}:${key}`
    return await profileDataCacher.cache(uniqueKey, async () =>
    {
        const result = writable(hexToUtf8(await profileContract.profiles(address, utf8AsBytes32(key))))

        function listen()
        {
            if (listeners[uniqueKey]) listeners[uniqueKey].count++
            else listeners[uniqueKey] = {
                count: 0, unlisten: listenContract(
                    profileContract, profileContract.filters.ProfileSet(address, utf8AsBytes32(key)),
                    async (owner, key, value: string, timestamp) =>
                    {
                        result.set(hexToUtf8(value))
                    })
            }
        }

        function unlisten()
        {
            const listener = listeners[uniqueKey]
            if (--listener.count <= 0) listener.unlisten()
        }

        return {
            value: result,
            listen,
            unlisten,
        }
    })
}

const ensNameStore = createTempStore<{ ensName: string }>('ens-name', 1000 * 60 * 60)
const ensNameCacher = createPromiseResultCacher()
export async function ensNameOf(address: string)
{
    const key = address.toLowerCase()
    return await ensNameCacher.cache(key, async () => 
    {
        const cache = await ensNameStore.get(key)
        if (cache) return cache.ensName

        const response = await (getDefaultProvider()).lookupAddress(address)
        if (response) await ensNameStore.put(key, { ensName: response })
        return response
    })
}