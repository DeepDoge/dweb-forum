import type { BigNumberish } from "ethers"
import { BigNumber } from "ethers"
import type { Writable } from "svelte/store"
import { get, writable } from "svelte/store"
import { decodeBigNumberArrayToString, stringToBigNumber } from "../common/stringToBigNumber"
import { appContract } from "../wallet"
import { listenContract } from "../wallet/listen"

export type PostData = Omit<Awaited<ReturnType<typeof appContract.getPostData>>, 'metadata'> & { metadata: Record<string, string | BigNumber> }
export type TimelineId = { group: BigNumberish, id: BigNumberish }
const posts: Record<string, Promise<Writable<PostData>>> = {}
const timelines: Record<string, Promise<Timeline>> = {}
const postRoots: Record<string, Promise<BigNumber[]>> = {}

export interface Timeline
{
    postIds: Writable<BigNumber[]>,
    length: Writable<BigNumber>,
    loadMore(): Promise<boolean | void>,
    loading: Writable<boolean>
}

function encodeMetadataKeys(keys: string[]): [BigNumber, BigNumber][]
{
    return keys.map((key) => [stringToBigNumber(key), BigNumber.from(0)])
}

function decodeMetadataResponse(reponseMetadata: ReturnType<typeof encodeMetadataKeys>): PostData['metadata']
{
    const metadata: PostData['metadata'] = {}
    for (const item of reponseMetadata)
        metadata[decodeBigNumberArrayToString([item[0]]), decodeBigNumberArrayToString([item[1]])]
    return metadata
}

export async function getPost(postId: BigNumber)
{
    const key = postId.toString()
    const cache = posts[key]
    if (cache) return await cache

    return posts[key] = (async () => {
        const response = await appContract.getPostData(postId, encodeMetadataKeys(['hidden']));
        return writable<PostData>({ ...response, metadata: decodeMetadataResponse(response.metadata) })
    })()
}

async function setPostData(postData: PostData)
{
    const key = postData.id.toString()
    posts[key] ? (await posts[key]).set(postData) : (posts[key] = (async () => writable(postData))())
}

export async function getPostRoot(postId: BigNumber): Promise<BigNumber[]>
{
    const cache = postRoots[postId.toString()]
    if (cache) return await cache

    return postRoots[postId.toString()] = (async () =>
    {
        const result: BigNumber[] = []
        let postData = get(await getPost(postId));
        while (postData?.post.timelineGroup.eq(3))
        {
            postData = get(await getPost(postData.post.timelineId));
            result.unshift(postData.id);
        }

        return result
    })()
}

const timelineListeners: Record<string, () => void> = {}

export async function getTimeline(timelineId: TimelineId): Promise<Timeline>
{
    const timelineIdKey = `${timelineId.group}:${timelineId.id}`
    let cache = timelines[timelineIdKey];
    if (cache) return await cache;

    return await (timelines[timelineIdKey] = (async () =>
    {
        console.log('new timeline', timelineId)

        const postIds: Writable<BigNumber[]> = writable([])
        let loading: Writable<boolean> = writable(false)

        const length = writable(await appContract.timelineLength(timelineId.group, timelineId.id));
        let pivot = get(length)

        const timelineKey = `${timelineId.group}:${timelineId.id}`

        if (timelineListeners[timelineKey]) timelineListeners[timelineKey]()

        timelineListeners[timelineKey] = listenContract(
            appContract, appContract.filters.TimelineAddPost(timelineId.group, timelineId.id),
            async (timelineGroup, timelineId, postId, timelineLength, timestamp) =>
            {
                length.set(timelineLength)
                if (get(postIds)[0] && postId.lte(get(postIds)[0])) return
                postIds.update((old) => [postId, ...old])
            })

        async function loadMore(): Promise<boolean | void>
        {
            if (get(loading)) return
            loading.set(true)
            try
            {
                const count = 64
                const promises: Promise<PostData>[] = []
                for (let i = 0; i < count; i++)
                {
                    pivot = pivot.sub(1)
                    if (pivot.lt(0)) break
                    postIds.update((old) => [...old, BigNumber.from(-i - 1)])
                    promises.push((async () =>
                    {
                        const response = await appContract.getTimelinePostData(timelineId.group, timelineId.id, pivot, encodeMetadataKeys(['hidden']))
                        const postData: PostData = { ...response, metadata: decodeMetadataResponse(response.metadata) }
                        setPostData(postData)
                        return postData
                    })())
                }
                await Promise.all(promises)
                postIds.update((old) => old.slice(0, old.length - promises.length))
                for (const promise of promises)
                {
                    const postData = await promise
                    postIds.update((old) => [...old, postData.id])
                }
                if (promises.length < count) return false
                return true
            }
            finally
            {
                loading.set(false)
            }
        }

        setTimeout(() => delete timelines[timelineIdKey], 1000 * 60)
        return {
            postIds,
            length,
            loadMore,
            loading
        }
    })())
}