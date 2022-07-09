import type { App, TimelineAddPostEvent } from "$/tools/hardhat/typechain-types/App"
import { account, appContract, provider } from "$/tools/wallet"
import { cachedPromise } from "$/utils/common/cachedPromise"
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

export const getTimelinePostsAtBlock = cachedPromise<
    { timelineId: TimelineId, blockNumber: number },
    { owner: string, postId: PostId, previousBlockPointer: BigNumber }[]
>(
    (params) => `${params.timelineId.group}:${params.timelineId.key}:${params.blockNumber}`,
    async ({ params }) =>
    {
        const events = (await appContract.queryFilter(
            appContract.filters.TimelineAddPost(packTimelineId(params.timelineId)),
            params.blockNumber,
            params.blockNumber + 1
        ))

        return events.map((event) =>
        {
            return {
                owner: event.args.owner,
                postId: event.args.postId,
                previousBlockPointer: event.args.previousBlockPointer
            }
        })
    }
)

export const getTimelineInfo = cachedPromise<{ timelineId: TimelineId }, { timelineInfo: Writable<TimelineInfo>, lastEvent: Writable<TimelineAddPostEvent> }>(
    (params) => `${params.timelineId.group}:${params.timelineId.key}`,
    async ({ params, setFinalizeCallback }) =>
    {
        const timelineIdPacked = packTimelineId(params.timelineId)
        const timeline = await appContract.timelines(timelineIdPacked)
        const timelineInfo: Writable<TimelineInfo> = writable({ length: timeline[0], lastBlockPointer: timeline.lastBlockPointer })
        const lastEvent: Writable<TimelineAddPostEvent> = writable(null)

        const filter = appContract.filters.TimelineAddPost(timelineIdPacked)
        const listener: TypedListener<TimelineAddPostEvent> = (timelineId, postId, owner, previousBlockPointer, timelineLength, event) =>
        {
            if (!(event.blockNumber > (get(lastEvent)?.blockNumber ?? get(timelineInfo).lastBlockPointer.toNumber()))) return
            timelineInfo.set({ length: timelineLength, lastBlockPointer: BigNumber.from(event.blockNumber) })
            lastEvent.set(event)
        }
        appContract.on(filter, listener)
        setFinalizeCallback(() => appContract.off(filter, listener))

        return {
            timelineInfo,
            lastEvent
        }
    }
)

export async function getTimeline(params: { timelineId: TimelineId })
{
    console.log(params.timelineId)

    const postIds = writable<PostId[]>([])
    let postIdsPublishedByCurrentSession: PostId[] = []
    const loadedPostIds: PostId[] = []
    const loading = writable(false)
    let done = false

    const timelineInfo = await getTimelineInfo({ timelineId: params.timelineId })
    let lengthCache = get(timelineInfo.timelineInfo).length
    let lastBlock = get(timelineInfo.timelineInfo).lastBlockPointer
    const newPostCount = writable(BigNumber.from(0))
    timelineInfo.lastEvent.subscribe((event) => 
    {
        if (!event) return
        if (event.args.owner === get(account))
        {
            postIdsPublishedByCurrentSession = [event.args.postId, ...postIdsPublishedByCurrentSession]
            postIds.set([...postIdsPublishedByCurrentSession, ...loadedPostIds])
            newPostCount.set(event.args.timelineLength.sub(lengthCache).sub(postIdsPublishedByCurrentSession.length))
        }
    })

    async function loadOlder()
    {
        if (done) return true
        if (lastBlock.gt(0))
        {
            loading.set(true)

            postIds.set([...postIdsPublishedByCurrentSession, BigNumber.from(-1), ...loadedPostIds])

            const posts = await getTimelinePostsAtBlock({
                timelineId: params.timelineId,
                blockNumber: lastBlock.toNumber()
            })
            loadedPostIds.push(...posts.map((post) => post.postId))

            lastBlock = posts[0]?.previousBlockPointer ?? BigNumber.from(0)

            postIds.set([...postIdsPublishedByCurrentSession, ...loadedPostIds])

            loading.set(false)
        }

        if (lastBlock.lte(0)) 
        {
            done = true
            return true
        }

        return false
    }


    return {
        timelineId: params.timelineId,
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