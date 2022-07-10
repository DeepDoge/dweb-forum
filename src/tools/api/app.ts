import type { App, TimelineAddPostEvent } from "$/tools/hardhat/typechain-types/App"
import { account, appContract, provider } from "$/tools/wallet"
import { cachedPromise } from "$/utils/common/cachedPromise"
import { cacheRecord } from "$/utils/common/cacheRecord"
import { promiseTask } from "$/utils/common/promiseTask"
import type { BigNumberish } from "ethers"
import { BigNumber } from "ethers"
import { get, writable, type Readable, type Writable } from "svelte/store"
import type { TypedListener } from "../hardhat/typechain-types/common"

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

export type Timeline = Awaited<ReturnType<typeof getTimeline>>
export type TimelineId = { group: BigNumberish, key: BigNumberish }
export type PostId = BigNumber



export type PostData =
    Omit<App.PostContentStructOutput, Exclude<keyof App.PostContentStructOutput, keyof App.PostContentStruct>> &
    Omit<App.PostStructOutput, Exclude<keyof App.PostStructOutput, keyof App.PostStruct>> &
    {
        postId: PostId
        owner: string
    }

export interface TimelineInfo
{
    length: BigNumber
    lastBlockPointer: BigNumber
}

export function packTimelineId(timelineId: TimelineId)
{
    return BigNumber.from(timelineId.group).shl(160).or(timelineId.key)
}

export const getPostData = cachedPromise<{ postId: PostId }, Writable<PostData>>(
    (params) => params.postId.toString(),
    async ({ params }) =>
    {
        const postInfo = await appContract.postInfos(params.postId)
        const [post, postContent] = (await Promise.all(
            [
                appContract.queryFilter(appContract.filters.PostPublished(params.postId), postInfo.postBlockPointer.toNumber(), postInfo.postBlockPointer.add(1).toNumber()),
                appContract.queryFilter(appContract.filters.PostContentPublished(params.postId), postInfo.postContentBlockPointer.toNumber(), postInfo.postContentBlockPointer.add(1).toNumber())
            ]
        ))

        return writable<PostData>({
            postId: params.postId,
            owner: postInfo.owner,
            timelineGroup: post[0].args[1].timelineGroup,
            timelineKey: post[0].args[1].timelineKey,
            title: postContent[0].args[1].title,
            data: postContent[0].args[1].data,
            mentions: postContent[0].args[1].mentions,
            time: postContent[0].args[1].time
        })
    }
)

interface TimelineBlockPost
{
    owner: string,
    postId: PostId,
    blockPoiter: number
    previousBlockPointer: number
}
const blockPostIdsCache = cacheRecord<PostId[]>()
const blockPostCache = cacheRecord<TimelineBlockPost>()
const getTimelinePostsAtBlock = promiseTask<{ timelineId: TimelineId, blockNumber: number }, TimelineBlockPost[]>(
    (params) => `${params.timelineId.group}:${params.timelineId.key}:${params.blockNumber}`,
    async ({ params }) =>
    {
        let postIds = blockPostIdsCache.get(params.blockNumber.toString())
        if (!postIds)
        {
            blockPostIdsCache.set(
                params.blockNumber.toString(),
                postIds = (await appContract.queryFilter(
                    appContract.filters.TimelineAddPost(packTimelineId(params.timelineId)),
                    params.blockNumber - 100,
                    params.blockNumber
                )).map((event) => 
                {
                    blockPostCache.set(event.args.postId.toString(), {
                        owner: event.args.owner,
                        postId: event.args.postId,
                        blockPoiter: event.blockNumber,
                        previousBlockPointer: event.args.previousBlockPointer.toNumber()
                    })
                    return event.args.postId
                })
            )
        }
        if (!postIds.map) console.log('wtfffuk', postIds)
        return postIds.map((postId) => blockPostCache.get(postId.toString()))
    }
)


export const getTimelineEvent = cachedPromise<{ timelineId: TimelineId }, Writable<TimelineAddPostEvent>>(
    (params) => `${params.timelineId.group}:${params.timelineId.key}`,
    async ({ params, setFinalizeCallback }) =>
    {
        const timelineIdPacked = packTimelineId(params.timelineId)
        const timeline = await appContract.timelines(timelineIdPacked)
        const lastEvent: Writable<TimelineAddPostEvent> = writable(
            (await appContract.queryFilter(
                appContract.filters.TimelineAddPost(timelineIdPacked),
                timeline.lastBlockPointer.toNumber(),
                timeline.lastBlockPointer.toNumber() + 1
            ))[0]
        )

        const filter = appContract.filters.TimelineAddPost(timelineIdPacked)
        const listener: TypedListener<TimelineAddPostEvent> = (timelineId, postId, owner, previousBlockPointer, timelineLength, event) =>
        {
            if (event.args.timelineLength <= get(lastEvent)?.args.timelineLength) return
            lastEvent.set(event)
        }
        appContract.on(filter, listener)
        setFinalizeCallback(() => appContract.off(filter, listener))

        return lastEvent
    }
)

export async function getTimeline(params: { timelineId: TimelineId })
{
    const postIds = writable<PostId[]>([])
    let postIdsPublishedByCurrentSession: PostId[] = []
    const loadedPostIds: PostId[] = []
    const loading = writable(false)
    let done = false

    const timelineEvent = await getTimelineEvent({ timelineId: params.timelineId })
    let timelineEventCache = get(timelineEvent)

    const lengthCache = timelineEventCache?.args.timelineLength ?? 0
    let pivotBlock = timelineEventCache?.blockNumber ?? 0

    const newPostCount = writable(BigNumber.from(0))

    timelineEvent.subscribe((event) => 
    {
        if (!event) return
        if (event.blockNumber === timelineEventCache?.blockNumber) return
        if (event.args.owner.toLocaleLowerCase() === get(account)?.toLocaleLowerCase())
        {
            postIdsPublishedByCurrentSession = [event.args.postId, ...postIdsPublishedByCurrentSession]
            postIds.set([...postIdsPublishedByCurrentSession, ...loadedPostIds])
        }
        newPostCount.set(event.args.timelineLength.sub(lengthCache).sub(postIdsPublishedByCurrentSession.length))
    })

    async function loadOlder()
    {
        if (done) return true
        if (pivotBlock > 0)
        {
            loading.set(true)

            postIds.set([...postIdsPublishedByCurrentSession, ...loadedPostIds, BigNumber.from(-1)])

            const posts = await getTimelinePostsAtBlock({
                timelineId: params.timelineId,
                blockNumber: pivotBlock
            })

            if (posts.length > 0)
            {
                pivotBlock = posts[0].previousBlockPointer
                const newPostIds = posts.map((post) => post.postId).reverse()
                postIds.set([...postIdsPublishedByCurrentSession, ...loadedPostIds, ...newPostIds.map((postId, i) => BigNumber.from((i + 1) * -1))])
                await Promise.all(newPostIds.map(async (postId) => await getPostData({ postId })))
                loadedPostIds.push(...newPostIds)
                postIds.set([...postIdsPublishedByCurrentSession, ...loadedPostIds])
            }
            else pivotBlock = 0
            loading.set(false)
        }

        if (pivotBlock === 0) 
        {
            done = true
            return true
        }

        return false
    }


    return {
        timelineId: params.timelineId,
        timelineEvent,
        newPostCount,
        postIds,
        loadOlder,
        loading
    }
}

(window as any).BigNumber = BigNumber

// Not caching this because postData is already cached
export async function getPostRoot({ postId }: { postId: PostId })
{
    const next = async (postId: PostId): Promise<PostId> =>
    {
        const postData = get(await getPostData({ postId }))
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