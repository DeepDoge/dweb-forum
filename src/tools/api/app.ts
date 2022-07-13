import type { App, TimelineAddPostEvent } from "$/tools/hardhat/typechain-types/App"
import { account, appContract } from "$/tools/wallet"
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
export type PostData =
    Omit<App.PostContentStructOutput, Exclude<keyof App.PostContentStructOutput, keyof App.PostContentStruct>> &
    Omit<App.PostStructOutput, Exclude<keyof App.PostStructOutput, keyof App.PostStruct>> &
    {
        postId: PostId
        owner: string
    }

export type TimelineId = { group: BigNumberish, key: BigNumberish }
export type PostId = BigNumber

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
        const _postData = await appContract.getPostData(params.postId, [])
        const postData: PostData = {
            postId: _postData.postId,
            ..._postData.post,
            ..._postData.postContent
        } as any
        return writable(postData)
    }
)

function setPostCache(params: { postId: PostId, postData: PostData })
{
    return getPostData._cacheRecord.set(params.postId.toString(), writable(params.postData))
}

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
                promises.push((async () =>
                {
                    const _postData = await appContract.getPostDataFromTimeline(timelineIdPacked, pivot, [])
                    const postData: PostData = {
                        postId: _postData.postId,
                        ..._postData.post,
                        ..._postData.postContent
                    } as any

                    console.log(postData)
                    setPostCache({ postId: postData.postId, postData })

                    return postData.postId
                })())
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