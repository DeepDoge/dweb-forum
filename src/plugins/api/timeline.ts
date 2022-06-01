import { BigNumber } from "ethers"
import type { BigNumberish } from "ethers"
import type { Writable } from "svelte/store"
import { get, writable } from "svelte/store"
import { appContract } from "../wallet"
import { listenContract } from "../wallet/listen"

export type PostData = Awaited<ReturnType<typeof appContract.getPostData>>
export type TimelineId = { group: BigNumberish, id: BigNumberish }
const posts: Record<string, Writable<PostData>> = {}

export async function getPost(postId: BigNumber)
{
    const key = postId.toString()
    return posts[key] ?? (posts[key] = writable(await appContract.getPostData(postId)))
}

function setPostData(postData: PostData)
{
    const key = postData.id.toString()
    posts[key] ? posts[key].set(postData) : (posts[key] = writable(postData))
}

const timelineListeners: Record<string, () => void> = {}

export async function getTimeline(timelineId: TimelineId)
{
    const postIds: Writable<BigNumber[]> = writable([])
    let loading: Writable<boolean> = writable(false)

    const length = (await appContract.timelineLength(timelineId.group, timelineId.id));
    let pivot = length

    const timelineKey = `${timelineId.group}:${timelineId.id}`

    if (timelineListeners[timelineKey]) timelineListeners[timelineKey]()

    timelineListeners[timelineKey] = listenContract(
        appContract, appContract.filters.TimelineAddPost(timelineId.group, timelineId.id),
        async (timelineGroup, timelineId, postId, timestamp) =>
        {
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
                    const postData = await appContract.getTimelinePostData(timelineId.group, timelineId.id, pivot)
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

    return {
        postIds,
        loadMore,
        loading
    }
}