import { BigNumber } from "ethers"
import type { Writable } from "svelte/store"
import { get, writable } from "svelte/store"
import { appContract } from "../wallet"
import { listenContract } from "../wallet/listen"

export type PostData = Awaited<ReturnType<typeof appContract.getPostData>>
export type TimelineId = Parameters<typeof appContract['getTimelineLength']>[0]
const posts: Record<string, Writable<PostData>> = {}

export async function getPost(postIndex: Parameters<typeof appContract.getPostData>[0])
{
    const key = postIndex.toString()
    return posts[key] ?? (posts[key] = writable(await appContract.getPostData(key)))
}

function setPostData(postData: PostData)
{
    const key = postData.post.index.toString()
    posts[key] ? posts[key].set(postData) : (posts[key] = writable(postData))
}

const timelineListeners: Record<string, () => void> = {}

export async function getTimeline(timelineId: TimelineId)
{
    const items: Writable<BigNumber[]> = writable([])
    let loading: Writable<boolean> = writable(false)

    const length = (await appContract.getTimelineLength(timelineId));
    let pivot = length

    if (timelineListeners[`${timelineId.group}:${timelineId.id}`]) timelineListeners[`${timelineId.group}:${timelineId.id}`]()
    timelineListeners[`${timelineId.group}:${timelineId.id}`] = listenContract(
        appContract, appContract.filters.TimelineAddPost(timelineId.group, timelineId.id),
        (timelineGroup, timelineId, postIndex, timelinePostIndex, postData, timestamp) =>
        {
            if (get(items)[0] && postIndex.lte(get(items)[0])) return
            setPostData(postData)
            items.update((old) => [postIndex, ...old])
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
                items.update((old) => [...old, BigNumber.from(-i - 1)])
                promises.push((async () =>
                {
                    const postData = await appContract.getTimelinePostData(timelineId, pivot)
                    setPostData(postData)
                    return postData
                })())
            }
            await Promise.all(promises)
            items.update((old) => old.slice(0, old.length - promises.length))
            for (const promise of promises)
            {
                const postData = await promise
                items.update((old) => [...old, postData.post.index])
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
        items,
        loadMore,
        loading
    }
}