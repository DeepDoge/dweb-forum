<script lang="ts">
    import { getPost, getPostRoot, getTimeline, PostData, Timeline, TimelineGroup, TimelineId } from "$/plugins/api/app";
    import { decodeBigNumberArrayToString } from "$/plugins/common/stringToBigNumber";
    import Post from "$lib/App/Post.svelte";
    import Posts from "$lib/App/Posts.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import { BigNumber } from "ethers";
    import type { Writable } from "svelte/store";
    import PublishPost from "./PublishPost.svelte";

    export let postId: BigNumber;
    let topPostData: Writable<PostData> = null;

    let repliesTimelineId: TimelineId;
    $: repliesTimelineId = postId ? { group: TimelineGroup.Replies, id: postId } : null;

    let repliesTimeline: Timeline = null;
    $: repliesTimelineLoading = repliesTimeline?.loading;

    let prefixPostIds: BigNumber[] = [];

    let loading = false;

    $: repliesTimelineId && updateReplies();
    async function updateReplies() {
        if (loading) return;
        loading = true;

        const [root, timeline] = await Promise.all([await getPostRoot({ postId }), await getTimeline({ timelineId: repliesTimelineId })]);
        // await timeline.loadMore();

        prefixPostIds = [...root, postId, BigNumber.from(0)];
        repliesTimeline = timeline;

        (async () => (topPostData = await getPost({ postId: prefixPostIds[0] })))();

        loading = false;
    }
</script>

<div class:loading class="post-reply-timeline">
    {#if topPostData && $topPostData.post.timelineGroup.eq(5)}
        <div class="topic-button">
            <KButton size="normal" color="master" href="#{decodeBigNumberArrayToString([$topPostData.post.timelineId])}">
                #{decodeBigNumberArrayToString([$topPostData.post.timelineId])}
            </KButton>
            <div>⌄</div>
        </div>
    {/if}
    <div class="posts">
        {#if loading && prefixPostIds.length === 0}
            <Post postId={BigNumber.from(-1)} />
        {/if}
        {#if repliesTimeline}
            <Posts timeline={repliesTimeline} let:postIds>
                {#each [...prefixPostIds, ...postIds] as postId (postId.toString())}
                    {#if postId.eq(0)}
                        <PublishPost reply timelineId={repliesTimelineId} />
                        <b>Replies{$repliesTimelineLoading ? "..." : ":"}</b>
                    {:else}
                        <div class="post" class:root-post={prefixPostIds.map((item) => item.toString()).includes(postId.toString())}>
                            <Post {postId} asLink />
                        </div>
                    {/if}
                {/each}
            </Posts>
        {/if}
    </div>
</div>

<style>
    .topic-button {
        display: grid;
        place-items: center;
    }

    .root-post + .root-post::before {
        content: "";
        position: absolute;
        border-left: dashed 0.15em var(--k-color-slave);
        height: var(--gap);
        transform: translateY(-100%) translateX(calc(var(--k-padding) * 5));
    }

    .post-reply-timeline {
        display: grid;
        gap: calc(var(--k-padding) * 5);
    }

    .posts {
        display: grid;
        --gap: calc(var(--k-padding) * 3);
        gap: var(--gap);
    }

    .loading {
        opacity: 0.5;
    }
</style>
