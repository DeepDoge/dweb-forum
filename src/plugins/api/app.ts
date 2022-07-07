import type { BigNumberish } from "ethers"
import { BigNumber } from "ethers"
import type { Writable } from "svelte/store"
import { get, writable } from "svelte/store"
import { cachedPromise } from "../../../modules/cachedPromise"
import type { TimelineAddPostEventObject } from "../hardhat/typechain-types/App"
import { bytesToBytes32, hexToUtf8, utf8AsBytes32 } from "../utils/bytes"
import { account, appContract } from "../wallet"
import { listenContract } from "../wallet/listen"

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

export type PostData = Omit<Awaited<ReturnType<typeof appContract.getPostData>>, 'metadata'> & { metadata: Record<string, string | BigNumber> }

export type TimelineId = { group: BigNumberish, id: BigNumberish }

export type Timeline = Awaited<ReturnType<typeof getTimeline>>

function encodeMetadataKeys(keys: string[]): [Uint8Array, Uint8Array][]
{
    return keys.map((key) => [utf8AsBytes32(key), bytesToBytes32(new Uint8Array())])
}

function decodeMetadataResponse(reponseMetadata: [string, string][]): PostData['metadata']
{
    const metadata: PostData['metadata'] = {}
    for (const item of reponseMetadata)
        metadata[hexToUtf8(item[0]), hexToUtf8(item[1])]
    return metadata
}

export const getPostData = cachedPromise<{ postId: BigNumber }, Writable<PostData>>(
    (params) => params.postId.toString(),
    async (params) =>
    {
        const response = await appContract.getPostData(params.postId, encodeMetadataKeys(['hidden']))
        return writable<PostData>({ ...response, metadata: decodeMetadataResponse(response.metadata) })
    }
)

function setPostData({ postData }: { postData: PostData })
{
    const key = postData.id.toString()
    getPostData._getCache(key) ? getPostData._getCache(key).set(postData) : getPostData._setCache(key, writable(postData))
}

export const getTimelinePostData = cachedPromise<{ timelineId: TimelineId, postIndex: BigNumber }, Writable<PostData>>(
    (params) => `${params.timelineId.group}:${params.timelineId.id}:${params.postIndex}`,
    async (params) =>
    {
        const postData = await appContract.getTimelinePostData(
            params.timelineId.group,
            params.timelineId.id,
            params.postIndex,
            [[utf8AsBytes32('hidden'), bytesToBytes32()]]
        )
        setPostData({ postData: { ...postData, metadata: decodeMetadataResponse(postData.metadata) } })

        return getPostData({ postId: postData.id })
    }
)

export const getTimelineLength = cachedPromise<{ timelineId: TimelineId }, { length: Writable<BigNumber>, listen(): void, unlisten(): void, lastEvent: Writable<TimelineAddPostEventObject> }>(
    (params) => `${params.timelineId.group}:${params.timelineId.id}`,
    async (params) =>
    {
        const length = writable(await appContract.getTimelineLength(params.timelineId.group, params.timelineId.id))
        const lastEvent: Writable<TimelineAddPostEventObject> = writable(null)

        let unlisten: () => void = null
        let listenerCount = 0
        async function listen()
        {
            if (listenerCount > 0) return

            unlisten = listenContract(
                appContract,
                appContract.filters.TimelineAddPost(params.timelineId.group, params.timelineId.id),
                (timelineGroup, timelineId, postId, owner, timelineLength, timestamp) =>
                {
                    if (timelineLength.lte(get(length))) return
                    lastEvent.set({
                        timelineGroup,
                        timelineId,
                        timelineLength,
                        owner,
                        postId,
                        timestamp
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
            lastEvent
        }
    }
)

export async function getTimeline(params: { timelineId: TimelineId })
{
    const postIds = writable<BigNumber[]>([])
    const postIdsPublishedByCurrentSession: BigNumber[] = []
    const loadedPostIds: BigNumber[] = []
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
    async function loadOlder()
    {
        loading.set(true)

        const promises: Promise<BigNumber>[] = []
        const placeHolderPostIds: BigNumber[] = []
        for (let i = 0; i < 64; i++)
        {
            if (loadOlderPivot.lt(0)) break

            placeHolderPostIds.push(BigNumber.from((i + 1) * -1))
            promises.push((async () =>
            {
                const postData = get(await getTimelinePostData({ timelineId: params.timelineId, postIndex: loadOlderPivot }))
                return postData.id
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
        length: lengthData.length,
        listen: lengthData.listen,
        unlisten: lengthData.unlisten,
        newPostCount,
        postIds,
        loadOlder,
        loading
    }
}

// Not caching this because postData is already cached
export async function getPostRoot({ postId }: { postId: BigNumber })
{
    const next = async (postId: BigNumber) =>
    {
        const postData = get(await getPostData({ postId }))
        if (postData.post.timelineGroup.eq(TimelineGroup.Replies))
            return postData.post.timelineId
        return null
    }
    const result: BigNumber[] = []

    let current = await next(postId)
    for (let i = 0; i < 16; i++)
    {
        if (!current) break
        result.unshift(current)
        current = await next(current)
    }

    return result
}