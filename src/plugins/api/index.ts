import { BigNumber } from "ethers"
import type { Writable } from "svelte/store"
import { writable } from "svelte/store"
import { appContract } from "../wallet"

export type PostType = Awaited<ReturnType<typeof appContract.posts>>
const posts: Record<string, Writable<PostType>> = {}

export async function getPost(postIndex: Parameters<typeof appContract.posts>[0])
{
    const index = postIndex.toString()
    return posts[index] ?? (posts[index] = writable(await appContract.posts(index)))
}

export async function getTimeline(id: Parameters<typeof appContract['timelineLength']>[0])
{
    const postIndexes: Writable<typeof downIndex[]> = writable([])
    let timelineCache = await appContract.getTimeline(id)
    const pivot = timelineCache.endIndex

    let downIndex = pivot.sub(1)

    async function loadMore()
    {
        timelineCache = await appContract.getTimeline(id)
        if (downIndex.lt(timelineCache.startIndex)) return false

        const link = await appContract.getTimelinePost(id, downIndex)
        
        downIndex = downIndex.lte(timelineCache.startIndex) ? BigNumber.from(-1) : link.beforePostIndex
        postIndexes.update((old) => ([...old, link.postIndex]))

        return true
    }

    let upIndex = pivot;

    async function loadNewer()
    {
        timelineCache = await appContract.getTimeline(id)
        if (upIndex.gt(timelineCache.endIndex)) return false;

        const link = await appContract.getTimelinePost(id, upIndex)

        upIndex = link.afterPostIndex.eq(0) ? upIndex.add(1) : link.afterPostIndex
        postIndexes.update((old) => ([link.postIndex, ...old]))

        return true
    }


    await loadNewer()

    return {
        postIndexes,
        loadMore,
        loadNewer
    }
}