import type { App, TimelineAddPostEvent } from "$/tools/hardhat/typechain-types/App"
import { account, appContract, provider } from "$/tools/wallet"
import { cachedPromise } from "$/utils/common/cachedPromise"
import { cacheRecord } from "$/utils/common/cacheRecord"
import { promiseQueue } from "$/utils/common/promiseQueue"
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

export const getTimelineInfo = cachedPromise<{ timelineId: TimelineId }, {
    lastEvent: Readable<TimelineAddPostEvent>
    length: Readable<BigNumber>
}>(
    (params) => `${params.timelineId.group}:${params.timelineId.key}`,
    async ({ params, setFinalizeCallback }) =>
    {
        const timelineIdPacked = packTimelineId(params.timelineId)
        const timelineLength = writable(await appContract.getTimelineLengh(timelineIdPacked))
        const lastEvent: Writable<TimelineAddPostEvent> = writable(null)

        const filter = appContract.filters.TimelineAddPost(timelineIdPacked)
        const listener: TypedListener<TimelineAddPostEvent> = (timelineId, postId, owner, newTimelineLength, event) =>
        {
            if (newTimelineLength.lte(get(timelineLength))) return
            timelineLength.set(newTimelineLength)
            lastEvent.set(event)
        }
        appContract.on(filter, listener)
        setFinalizeCallback(() => appContract.off(filter, listener))

        return {
            lastEvent,
            length: timelineLength
        }
    }
)

export async function getTimeline(params: { timelineId: TimelineId })
{
    const postIds = writable<PostId[]>([])

    let postIdsPublishedByCurrentSession: PostId[] = []
    const loadedPostIds: PostId[] = []
    let placeholderPostIds: PostId[] = []

    const loading = writable(false)
    let done = false

    const timelineIdPacked = packTimelineId(params.timelineId)
    const timelineInfo = await getTimelineInfo({ timelineId: params.timelineId })

    const lengthCache = get(timelineInfo.length) ?? BigNumber.from(0)
    const newPostCount = writable(BigNumber.from(0))

    timelineInfo.lastEvent.subscribe((event) => 
    {
        if (!event) return
        if (event.args.owner.toLocaleLowerCase() === get(account)?.toLocaleLowerCase())
        {
            postIdsPublishedByCurrentSession = [event.args.postId, ...postIdsPublishedByCurrentSession]
            updatePostIds()
        }
        newPostCount.set(event.args.timelineLength.sub(lengthCache).sub(postIdsPublishedByCurrentSession.length))
    })

    let pivot = lengthCache.sub(1)

    function updatePostIds()
    {
        postIds.set([...postIdsPublishedByCurrentSession, ...loadedPostIds, ...placeholderPostIds])
    }

    async function loadOlder()
    {
        if (done) return true

        if (pivot.gte(0))
        {
            loading.set(true)
            const promises: Promise<BigNumber>[] = []
            for (let i = 0; i < 64; i++)
            {
                promises.push(appContract.timelines(timelineIdPacked, pivot))
                pivot = pivot.sub(1)
                placeholderPostIds.push(BigNumber.from((i + 1) * -1))
                if (pivot.lt(0)) break
            }
            updatePostIds()

            placeholderPostIds = []
            loadedPostIds.push(...await Promise.all(promises))
            updatePostIds()

            loading.set(false)
        }

        if (pivot.lt(0)) done = true
        return done
    }


    return {
        timelineId: params.timelineId,
        timelineInfo,
        newPostCount: newPostCount as Readable<BigNumber>,
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