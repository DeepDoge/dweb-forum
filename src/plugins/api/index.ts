import { BigNumber } from "ethers"
import { get, writable } from "svelte/store"
import type { Writable } from "svelte/store"
import { appContract } from "../wallet"

export type PostType = Awaited<ReturnType<typeof appContract.posts>>
export type TimelineId = Parameters<typeof appContract['timelineLength']>[0]
const posts: Record<string, Writable<PostType>> = {}

export async function getPost(postIndex: Parameters<typeof appContract.posts>[0])
{
    const index = postIndex.toString()
    return posts[index] ?? (posts[index] = writable(await appContract.posts(index)))
}

export async function getTimeline(id: TimelineId)
{
    const items: Writable<{ index: BigNumber, timelinePostIndex: BigNumber }[]> = writable([])
    let timelineCache = await appContract.getTimeline(id)
    const pivot = timelineCache.endIndex

    let downIndex = pivot.sub(1)
    let loadMoreRunnning: ReturnType<typeof loadMore> = null

    async function loadMore(): Promise<boolean | void>
    {
        if (loadMoreRunnning) return

        timelineCache = await appContract.getTimeline(id)
        if (downIndex.lt(timelineCache.startIndex)) return false

        const timelinePostIndex = downIndex
        const link = await appContract.getTimelinePost(id, timelinePostIndex)

        downIndex = downIndex.lte(timelineCache.startIndex) ? BigNumber.from(-1) : link.beforePostIndex
        items.update((old) => ([...old, { index: link.postIndex, timelinePostIndex }]))
        
        return true

    }

    let upIndex = pivot
    let loadNewerRunning: boolean = false

    async function loadNewer(): Promise<boolean | void>
    {
        if (loadNewerRunning) return
        loadNewerRunning = true
        if (get(items).length === 0 && (await appContract.timelineLength(id)).eq(0)) return false

        timelineCache = await appContract.getTimeline(id)
        console.log(timelineCache)
        if (upIndex.gt(timelineCache.endIndex)) return false

        const timelinePostIndex = upIndex
        const link = await appContract.getTimelinePost(id, timelinePostIndex)

        upIndex = link.afterPostIndex.eq(0) ? upIndex.add(1) : link.afterPostIndex
        items.update((old) => ([{ index: link.postIndex, timelinePostIndex }, ...old]))

        loadNewerRunning = false
        return true
    }

    return {
        items,
        loadMore,
        loadNewer
    }
}