import { cachedPromise } from "$modules/cachedPromise";
import type { Writable } from "svelte/store";
import { writable } from "svelte/store";
import { decodeBigNumberArrayToString, stringToBigNumber } from "../common/stringToBigNumber";
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
            const result = writable(decodeBigNumberArrayToString([await profileContract.profiles(address, stringToBigNumber(key))]))
            const listenerKey = `${address}:${key}`

            function listen()
            {
                if (listeners[listenerKey]) listeners[listenerKey].count++
                else listeners[listenerKey] = {
                    count: 0, unlisten: listenContract(
                        profileContract, profileContract.filters.ProfileSet(address, stringToBigNumber(key)),
                        async (owner, key, value, timestamp) =>
                        {
                            result.set(decodeBigNumberArrayToString([value]))
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