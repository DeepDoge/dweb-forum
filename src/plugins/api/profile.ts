import { cachedPromise } from "$modules/cachedPromise";
import type { Writable } from "svelte/store";
import { writable } from "svelte/store";
import { bigNumberArrayAsString, stringAsUint256 } from "../utils/string";
import { profileContract } from "../wallet";
import { listenContract } from "../wallet/listen";

export interface ProfileInfo
{
    value: Writable<string>
    listen(): void
    unlisten(): void
}

const listeners: Record<string, { count: number, unlisten: () => void }> = {}
export const getProfileData = cachedPromise<
    { address: string, key: string }, ProfileInfo>(
        ({ address, key }) => `${address}:${key}`,
        async ({ address, key }) =>
        {
            const result = writable(bigNumberArrayAsString([await profileContract.profiles(address, stringAsUint256(key))]))
            const listenerKey = `${address}:${key}`

            function listen()
            {
                if (listeners[listenerKey]) listeners[listenerKey].count++
                else listeners[listenerKey] = {
                    count: 0, unlisten: listenContract(
                        profileContract, profileContract.filters.ProfileSet(address, stringAsUint256(key)),
                        async (owner, key, value, timestamp) =>
                        {
                            result.set(bigNumberArrayAsString([value]))
                        })
                }
            }

            function unlisten()
            {
                const listener = listeners[listenerKey]
                console.log('unlisten profile info', listenerKey, listener.count)
                if (--listener.count <= 0) listener.unlisten()
            }

            return {
                value: result,
                listen,
                unlisten,
            }
        }
    )