import deployed from '$/tools/hardhat/scripts/deployed.json'
import { createPermaStore, createPromiseResultCacher, createTempStore } from "$/utils/common/store"
import { BigNumber, type BigNumberish } from "ethers"
import { get, writable, type Writable } from "svelte/store"
import type { TimelineAddPostEvent } from '../hardhat/typechain-types/contracts/Posts'
import type { Posts } from '../hardhat/typechain-types/contracts/ResolvePost'
import { postsContract, resolvePostContract, wallet } from '../wallet'
import { listenContract } from "../wallet/listen"

const followedTopics = createPermaStore<{ topic: string }>(`${deployed[wallet.provider.network.chainId]['Posts']}:followed`)
export async function followTopic(topic: string)
{
    await followedTopics.put(wallet.account, { topic })
}

export type PostId = BigNumber
export type PostData =
    Omit<Posts.PostContentStructOutput, Exclude<keyof Posts.PostContentStructOutput, keyof Posts.PostContentStruct>> &
    Omit<Posts.PostStructOutput, Exclude<keyof Posts.PostStructOutput, keyof Posts.PostStruct>> &
    {
        postId: PostId
        owner: string
    }

function deserializeBigNumbers(thing: object)
{
    return Object.fromEntries(
        Object.entries(thing)
            .map(([key, value]) => [key, BigNumber.isBigNumber(value) ? BigNumber.from(value) : value])
    )
}

const postDataStore = createTempStore(`${deployed[wallet.provider.network.chainId]?.['App']}:posts`)
const postDataCacher = createPromiseResultCacher()
export async function getPostData(postId: PostId): Promise<Writable<PostData>>
{
    return await postDataCacher.cache(postId._hex, async () =>
    {
        const cache = await postDataStore.get(postId._hex)
        if (cache) return writable(deserializeBigNumbers(cache) as PostData)

        const response = await resolvePostContract.getPostData(postId, [])
        const postData: PostData = {
            postId: response.postId,
            ...response.post,
            ...response.postContent
        }

        await postDataStore.put(postId._hex, postData)

        return writable(postData)
    })
}

// Not caching this because postData is already cached
export async function getPostRoot({ postId }: { postId: PostId })
{
    const next = async (postId: PostId): Promise<PostId> =>
    {
        const postData = get(await getPostData(postId))
        if (postData.timelineGroup.eq(TimelineGroup.Replies))
            return postData.timelineKey
        return null
    }
    const result: PostId[] = []

    let current = await next(postId)
    for (let i = 0; i < 16; i++)
    {
        if (!current) break
        result.unshift(current)
        current = await next(current)
    }

    return result
}

export const enum TimelineGroup
{
    ProfilePosts = 0,
    ProfileReplies = 1,
    ProfileMentions = 2,
    AllPostsInGroup = 3,
    LastInternal = 3,
    Replies = 4,
    Topics = 5,
    LastDefault = 5
}

export type TimelineId = { group: BigNumberish, key: BigNumberish }
export type Feed = Awaited<ReturnType<typeof getFeed>>

export function packTimelineId(timelineId: TimelineId)
{
    return BigNumber.from(timelineId.group).shl(160).or(timelineId.key)
}

const timelinePostStore = createTempStore(`${deployed[wallet.provider.network.chainId]?.['App']}:timelines`)
const timelinePostCacher = createPromiseResultCacher()
export async function getTimelinePost(timelineId: TimelineId, postIndex: BigNumber)
{
    const key = `${BigNumber.from(timelineId.group)._hex}:${BigNumber.from(timelineId.key)._hex}:${postIndex._hex}`
    return await timelinePostCacher.cache(key, async () =>
    {
        const cache = await timelinePostStore.get(key)
        if (cache) return await getPostData(BigNumber.from(cache))

        const timelineIdPacked = packTimelineId(timelineId)
        const respose = await resolvePostContract.getPostDataFromTimeline(timelineIdPacked, postIndex, [])

        await timelinePostStore.put(key, respose.postId)

        const postData: PostData = { postId: respose.postId, ...respose.post, ...respose.postContent }

        await postDataStore.put(respose.postId._hex, postData)

        return await getPostData(postData.postId)
    })
}

export type TimelineInfo = Awaited<ReturnType<typeof getTimelineInfo>>
const timelineInfoCacher = createPromiseResultCacher()
const timelineInfoListeners: Record<string, { count: number, unlisten: () => void }> = {}
export async function getTimelineInfo(timelineId: TimelineId)
{
    const uniqueKey = `${BigNumber.from(timelineId.group)._hex}:${BigNumber.from(timelineId.key)}`
    const timelineIdPacked = packTimelineId(timelineId)
    return await timelineInfoCacher.cache(uniqueKey, async () =>
    {
        const length = writable(await postsContract.getTimelineLengh(timelineIdPacked))
        const lastEvent: Writable<TimelineAddPostEvent> = writable(null)

        function listen()
        {
            if (timelineInfoListeners[uniqueKey]) timelineInfoListeners[uniqueKey].count++
            else timelineInfoListeners[uniqueKey] = {
                count: 1, unlisten: listenContract(
                    postsContract, postsContract.filters.TimelineAddPost(timelineIdPacked
                    ),
                    async (timelineIdPacked, postId, owner, timelineLength, event) =>
                    {
                        if (get(length) >= timelineLength) return
                        length.set(timelineLength)
                        lastEvent.set(event)
                    })
            }
        }

        function unlisten()
        {
            const listener = timelineInfoListeners[uniqueKey]
            if (--listener.count === 0) listener.unlisten()
            if (listener.count < 0) throw "Listener count is lower than 0, this is not suppose to happen."
        }

        return {
            length,
            listen,
            unlisten,
            lastEvent
        }
    })

}

export function getFeed(timelineIds: TimelineId[])
{
    const timelines: Record<string, {
        info: TimelineInfo
        pivot: BigNumber
        done: boolean,
        waitingPostIds: PostId[]
    }> = {}
    const getTimelineKey = (timelineId: TimelineId) => `${BigNumber.from(timelineId.group)._hex}:${BigNumber.from(timelineId.key)._hex}`

    const postIds: Writable<PostId[]> = writable([])
    const loadedPostIds: PostId[] = []
    const loadedByCurrentSessionPostIds: PostId[] = []
    let setAsReady: () => void = null
    const ready = new Promise<void>((resolve) => setAsReady = resolve)
    const loading: Writable<boolean> = writable(false)
    const newPostCount = writable(BigNumber.from(0))

    function refreshPostIds()
    {
        const value = [...loadedByCurrentSessionPostIds, ...loadedPostIds]
        if (get(postIds).length === 0 && value.length === 0) return
        postIds.set(value)
    }

    const LOAD_CHUNK_SIZE = 64

    async function loadMore()
    {
        if (get(loading)) throw `Tried to loadMore while loading`
        loading.set(true)

        if (!timelines[getTimelineKey(timelineIds[0])]) 
        {
            await Promise.all(
                timelineIds.map(async (timelineId) =>
                {
                    const timelineIdKey = getTimelineKey(timelineId)
                    const info = await getTimelineInfo(timelineId)
                    timelines[timelineIdKey] = {
                        info,
                        pivot: get(info.length).sub(1),
                        done: false,
                        waitingPostIds: []
                    }

                    let first = true
                    info.lastEvent.subscribe((event) =>
                    {
                        if (first) return first = false
                        if (event.args.owner.toLowerCase() === wallet.account?.toLowerCase())
                        {
                            loadedByCurrentSessionPostIds.unshift(event.args.postId)
                            refreshPostIds()
                        }
                        else
                        {
                            console.log('add 1')
                            newPostCount.update((value) => value.add(1))
                        }
                    })
                })
            )
        }

        const timelinePromises = timelineIds.map(async (timelineId) =>
        {
            const timelineIdKey = getTimelineKey(timelineId)
            const timeline = timelines[timelineIdKey]

            if (timeline.waitingPostIds.length >= LOAD_CHUNK_SIZE)
                return timeline.done

            if (timeline.done)
                return timeline.done

            const postPromises: Promise<PostId>[] = []

            for (let i = 0; i < LOAD_CHUNK_SIZE; i++)
            {
                if (timeline.pivot.lt(0)) break

                postPromises.push((async () => get(await getTimelinePost(timelineId, timeline.pivot)).postId)())

                timeline.pivot = timeline.pivot.sub(1)
            }

            timeline.waitingPostIds.push(...await Promise.all(postPromises))

            if (timeline.pivot.lt(0) && timeline.waitingPostIds.length === 0)
                timeline.done = true

            return timeline.done
        })

        const results = await Promise.all(timelinePromises)
        const done = results.some((result) => result === false) ? false : true

        const postIdsOfThisChunk: PostId[] = []
        while (postIdsOfThisChunk.length < LOAD_CHUNK_SIZE)
        {
            let newestFrom: string = null

            for (const [key, timeline] of Object.entries(timelines))
            {
                if (timeline.waitingPostIds.length === 0) continue
                if (newestFrom === null || timeline.waitingPostIds[0].lt(timelines[newestFrom].waitingPostIds[0]))
                    newestFrom = key
            }

            if (newestFrom === null) break

            const newestPostId = timelines[newestFrom].waitingPostIds.shift()
            postIdsOfThisChunk.push(newestPostId)
        }

        loadedPostIds.push(...postIdsOfThisChunk)
        refreshPostIds()

        loading.set(false)
        setAsReady()
        return done
    }

    let listenReady = true
    async function listen()
    {
        listenReady = false
        while (!timelines[getTimelineKey(timelineIds[0])]) await new Promise((r) => setTimeout(r, 100))
        for (const [key, timeline] of Object.entries(timelines))
            timeline.info.listen()
        listenReady = true
    }

    async function unlisten()
    {
        while (!listenReady) await new Promise((r) => setTimeout(r, 100))
        for (const [key, timeline] of Object.entries(timelines))
            timeline.info.unlisten()
    }


    return {
        timelineIds,
        postIds,
        loadMore,
        loading,
        ready,
        newPostCount,
        listen,
        unlisten
    }
}