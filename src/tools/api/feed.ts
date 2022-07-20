import { account, appContract, provider } from "$/tools/wallet"
import { cachePromiseResult, createPermaStore, createTempStore } from "$/utils/common/store"
import { BigNumber, type BigNumberish } from "ethers"
import { get, writable, type Writable } from "svelte/store"
import type { App } from "../hardhat/typechain-types"

const followedTopics = createPermaStore<{ topic: string }>(get(provider).network.chainId.toString(), 'followed-topics')
export async function followTopic(topic: string)
{
    await followedTopics.put(get(account), { topic })
}

export type PostId = BigNumber
export type PostData =
    Omit<App.PostContentStructOutput, Exclude<keyof App.PostContentStructOutput, keyof App.PostContentStruct>> &
    Omit<App.PostStructOutput, Exclude<keyof App.PostStructOutput, keyof App.PostStruct>> &
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

const postDataCacheStore = createTempStore(get(provider).network.chainId.toString(), 'posts')
export async function getPostData(postId: PostId): Promise<Writable<PostData>>
{
    return await cachePromiseResult(postId._hex, async () =>
    {
        const cache = await postDataCacheStore.get(postId._hex)
        if (cache) return writable(deserializeBigNumbers(cache) as PostData)

        const response = await appContract.getPostData(postId, [])
        const postData: PostData = {
            postId: response.postId,
            ...response.post,
            ...response.postContent
        } as any

        await postDataCacheStore.put(postId._hex, postData)

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

const timelinePostStore = createTempStore(get(provider).network.chainId.toString(), 'timelines')
export async function getTimelinePost(timelineId: TimelineId, postIndex: BigNumber)
{
    const key = `${BigNumber.from(timelineId.group)._hex}:${BigNumber.from(timelineId.key)._hex}:${postIndex._hex}`
    return await cachePromiseResult(key, async () =>
    {
        const cache = await timelinePostStore.get(key)
        if (cache) return await getPostData(BigNumber.from(cache))

        const timelineIdPacked = packTimelineId(timelineId)
        const respose = await appContract.getPostDataFromTimeline(timelineIdPacked, postIndex, [])

        await timelinePostStore.put(key, respose.postId)

        const postData: PostData = { postId: respose.postId, ...respose.post, ...respose.postContent }

        await postDataCacheStore.put(respose.postId._hex, postData)

        return await getPostData(postData.postId)
    })
}

export type TimelineInfo = Awaited<ReturnType<typeof getTimelineInfo>>
export async function getTimelineInfo(timelineId: TimelineId)
{
    const length = writable(await appContract.getTimelineLengh(packTimelineId(timelineId)))
    return {
        length
    }
}

export async function getFeed(timelineIds: TimelineId[])
{
    const timelines: Record<string, {
        info: TimelineInfo
        pivot: BigNumber
        done: boolean,
        waitingPostIds: PostId[]
    }> = {}
    const getTimelineKey = (timelineId: TimelineId) => `${BigNumber.from(timelineId.group)._hex}:${BigNumber.from(timelineId.key)._hex}`

    const postIds: Writable<PostId[]> = writable([])
    const loading: Writable<boolean> = writable(false)
    const newPostCount = writable(BigNumber.from(0))

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
        })
    )

    const LOAD_CHUNK_SIZE = 64

    async function loadMore()
    {
        if (get(loading)) throw `Tried to loadMore while loading`
        loading.set(true)

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

        postIds.update((postIds) => [...postIdsOfThisChunk, ...postIds])

        loading.set(false)
        return done
    }

    return {
        timelineIds,
        postIds,
        loadMore,
        loading,
        newPostCount
    }
}