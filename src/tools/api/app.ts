import type { App, TimelineAddPostEventObject } from "$/tools/hardhat/typechain-types/App"
import { account, appContract, provider } from "$/tools/wallet"
import { listenContract } from "$/tools/wallet/listen"
import { bytesToBytes32, hexToUtf8, utf8AsBytes32 } from "$/utils/common/bytes"
import { cachedPromise } from "$/utils/common/cachedPromise"
import type { OmitMatch, ReplaceType } from "$/utils/common/types"
import type { BigNumberish } from "ethers"
import { BigNumber } from "ethers"
import { get, readable, writable, type Readable, type Writable } from "svelte/store"

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
export type PostId = string



export type PostData =
    Omit<App.PostContentStructOutput, Exclude<keyof App.PostContentStructOutput, keyof App.PostContentStruct>> &
    Omit<App.PostStructOutput, Exclude<keyof App.PostStructOutput, keyof App.PostStruct>> &
    {
        postId: PostId 
        owner: string 
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
            timelinePostIndex: post[0].args[1].timelinePostIndex,
            title: postContent[0].args[1].title,
            data: postContent[0].args[1].data,
            mentions: postContent[0].args[1].mentions,
            time: postContent[0].args[1].time
        })
    }
)

export const getTimelinePostInfo = cachedPromise<{ timelineId: TimelineId, postIndex: BigNumber, blockNumber: number }, { owner: string, postId: PostId, blockNumber: number }>(
    (params) => `${params.timelineId.group}:${params.timelineId.key}:${params.postIndex}`,
    async ({ params }) =>
    {
        const timelinePostInfo = (await appContract.queryFilter(appContract.filters.TimelineAddPost(packTimelineId(params.timelineId), params.postIndex), params.blockNumber - 5000, params.blockNumber))?.[0]
        if (!timelinePostInfo) throw `Index ${params.postIndex} doesn't exist on timeline (${params.timelineId.group}, ${params.timelineId.key})`
        return { owner: timelinePostInfo.args.owner, postId: timelinePostInfo.args.postId, blockNumber: timelinePostInfo.blockNumber }
    }
)

type LastTimelineLengthEvent = TimelineAddPostEventObject & { timelineLength: BigNumber }
export const getTimelineLength = cachedPromise<
    { timelineId: TimelineId },
    {
        length: Writable<BigNumber>,
        listen(): void,
        unlisten(): void,
        lastEvent: Readable<LastTimelineLengthEvent>
    }
>(
    (params) => `${params.timelineId.group}:${params.timelineId.key}`,
    async ({ params }) =>
    {
        const length = writable(await appContract.getTimelineLength(params.timelineId.group, params.timelineId.key))
        const lastEvent: Writable<LastTimelineLengthEvent> = writable(null)

        let unlisten: () => void = null
        let listenerCount = 0
        async function listen()
        {
            if (listenerCount > 0) return

            unlisten = listenContract(
                appContract,
                appContract.filters.TimelineAddPost(packTimelineId(params.timelineId)),
                (timelineId, postIndex, postId, owner) =>
                {
                    const timelineLength = postIndex.add(1)
                    if (timelineLength.lte(get(length))) return
                    lastEvent.set({
                        timelineId,
                        timelineLength,
                        postIndex,
                        owner,
                        postId
                    })
                    length.set(timelineLength)
                }
            )
            listenerCount++
        }

        return {
            length,
            listen,
            unlisten()
            {
                if (listenerCount === 0) return
                if (--listenerCount === 0)
                    unlisten()
            },
            lastEvent: readable(get(lastEvent), (set) => lastEvent.subscribe((value) => set(value)))
        }
    }
)

export async function getTimeline(params: { timelineId: TimelineId })
{
    const postIds = writable<PostId[]>([])
    const postIdsPublishedByCurrentSession: PostId[] = []
    const loadedPostIds: PostId[] = []
    const loading = writable(false)
    let done = false

    const lengthData = await getTimelineLength({ timelineId: params.timelineId })
    const newPostCount = writable(BigNumber.from(0))
    const pivotIndex = get(lengthData.length).sub(1)
    lengthData.lastEvent.subscribe((params) => 
    {
        if (!params) return
        if (params.owner.toLowerCase() === get(account)?.toLowerCase()) 
        {
            postIdsPublishedByCurrentSession.unshift(params.postId)
            if (done) postIds.set([...postIdsPublishedByCurrentSession, ...loadedPostIds])
        }
        newPostCount.set(params.timelineLength.sub(pivotIndex).sub(1).sub(postIdsPublishedByCurrentSession.length))
    })

    let loadOlderPivot = pivotIndex
    let loadOlderBlockPivot = await get(provider).getBlockNumber()
    async function loadOlder()
    {
        loading.set(true)

        const promises: Promise<PostId>[] = []
        const placeHolderPostIds: PostId[] = []
        for (let i = 0; i < 64; i++)
        {
            if (loadOlderPivot.lt(0)) break

            placeHolderPostIds.push(`placeholder${i}`)
            promises.push((async () =>
            {
                const postInfo = await getTimelinePostInfo({ timelineId: params.timelineId, postIndex: loadOlderPivot, blockNumber: loadOlderBlockPivot })
                if (postInfo.blockNumber < loadOlderBlockPivot) loadOlderBlockPivot = postInfo.blockNumber
                return postInfo.postId
            })())

            loadOlderPivot = loadOlderPivot.sub(1)
        }

        postIds.set([...postIdsPublishedByCurrentSession, ...loadedPostIds, ...placeHolderPostIds])
        const newPostIds = await Promise.all(promises)
        loadedPostIds.push(...newPostIds)
        postIds.set([...postIdsPublishedByCurrentSession, ...loadedPostIds])

        loading.set(false)
        if (done = (newPostIds.length === 0)) return false
        return true
    }

    return {
        timelineId: params.timelineId,
        lengthData,
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
    const next = async (postId: PostId) =>
    {
        const postData = get(await getPostData({ postId }))
        if (postData.timelineGroup.eq(TimelineGroup.Replies))
            return postData.timelineKey._hex
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