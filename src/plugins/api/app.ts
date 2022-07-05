import type { BigNumberish } from "ethers"
import { BigNumber } from "ethers"
import type { Writable } from "svelte/store"
import { get, writable } from "svelte/store"
import { cachedPromise } from "../../../modules/cachedPromise"
import { bigNumberArrayAsString, stringAsUint256 } from "../utils/string"
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

function encodeMetadataKeys(keys: string[]): [BigNumber, BigNumber][]
{
    return keys.map((key) => [stringAsUint256(key), BigNumber.from(0)])
}

function decodeMetadataResponse(reponseMetadata: ReturnType<typeof encodeMetadataKeys>): PostData['metadata']
{
    const metadata: PostData['metadata'] = {}
    for (const item of reponseMetadata)
        metadata[bigNumberArrayAsString([item[0]]), bigNumberArrayAsString([item[1]])]
    return metadata
}

export const getPostData = cachedPromise<{ postId: BigNumber }, Writable<PostData>>(
    (params) => params.postId.toString(),
    async (params) =>
    {
        const response = await appContract.getPostData(params.postId, encodeMetadataKeys(['hidden']));
        return writable<PostData>({ ...response, metadata: decodeMetadataResponse(response.metadata) })
    }
)

function setPostData({ postData }: { postData: PostData })
{
    const key = postData.id.toString()
    getPostData._getCache(key) ? getPostData._getCache(key).set(postData) : getPostData._setCache(key, writable(postData))
}

export async function getTimeline(params: { timelineId: TimelineId })
{
    const length = writable(await appContract.getTimelineLength(params.timelineId.group, params.timelineId.id))
    const newPostCount = writable(BigNumber.from(0))

    const pivotIndex = get(length).sub(1)
    const postIds = writable<BigNumber[]>([])

    const loading = writable(false)

    const postIdsPublishedByCurrentSession: BigNumber[] = []
    const loadedPostIds: BigNumber[] = []

    length.subscribe((length) => newPostCount.set(length.sub(pivotIndex).sub(1).sub(postIdsPublishedByCurrentSession.length)))

    let done = false
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
                const postData = await appContract.getTimelinePostData(
                    params.timelineId.group,
                    params.timelineId.id,
                    loadOlderPivot,
                    [[stringAsUint256('hidden'), 0]]
                )
                setPostData({ postData: { ...postData, metadata: decodeMetadataResponse(postData.metadata) } })
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

    let unlisten: () => void = null
    async function listen()
    {
        unlisten?.call(null)
        unlisten = listenContract(
            appContract,
            appContract.filters.TimelineAddPost(params.timelineId.group, params.timelineId.id),
            (timelineGroup, timelineId, postId, owner, timelineLength) =>
            {
                if (timelineLength.lte(get(length))) return
                if (owner.toLowerCase() === get(account)) 
                {
                    postIdsPublishedByCurrentSession.unshift(postId)
                    if (done) postIds.set([...postIdsPublishedByCurrentSession, ...loadedPostIds])
                }
                length.set(timelineLength)
            }
        )
    }

    return {
        timelineId: params.timelineId,
        length,
        listen,
        unlisten,
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