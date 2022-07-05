import { cachedPromise } from "$modules/cachedPromise";
import type { Writable } from "svelte/store";
import { writable } from "svelte/store";
import { hexToUtf8, utf8AsBytes32 } from "../utils/bytes";
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
            const result = writable(hexToUtf8(await profileContract.profiles(address, utf8AsBytes32(key))))
            const listenerKey = `${address}:${key}`

            function listen()
            {
                if (listeners[listenerKey]) listeners[listenerKey].count++
                else listeners[listenerKey] = {
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
                const listener = listeners[listenerKey]
                if (--listener.count <= 0) listener.unlisten()
            }

            return {
                value: result,
                listen,
                unlisten,
            }
        }
    )