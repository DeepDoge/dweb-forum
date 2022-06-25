<script lang="ts">
    import { getPostRoot, getTimeline, Timeline, TimelineId } from "$/plugins/api/timeline";
    import Post from "$lib/App/Post.svelte";
    import Posts from "$lib/App/Posts.svelte";
    import { BigNumber } from "ethers";
    import { get } from "svelte/store";
    import PublishPost from "./PublishPost.svelte";

    export let postId: BigNumber;

    let repliesTimelineId: TimelineId;
    $: repliesTimelineId = postId ? { group: 3, id: postId } : null;

    let repliesTimeline: Timeline = null;
    $: repliesTimelineLoading = repliesTimeline?.loading;

    let prefixPostIds: BigNumber[] = [];

    let loading = false;

    $: repliesTimelineId && updateReplies();
    async function updateReplies() {
        if (loading) return;
        loading = true;

        const promises = await Promise.all([
            getPostRoot(postId),
            (async () => {
                const t = await getTimeline(repliesTimelineId);
                await t.loadMore();
                return t;
            })(),
        ]);

        prefixPostIds = [...promises[0], postId, BigNumber.from(0)];
        repliesTimeline = promises[1];

        loading = false;
    }
</script>

<div class:loading>
    <Posts timeline={repliesTimeline} let:postIds>
        {#each [...prefixPostIds, ...postIds] as postId (postId.toString())}
            {#if postId.eq(0)}
                <PublishPost reply timelineId={repliesTimelineId} />
                <b>Replies{$repliesTimelineLoading ? "..." : ":"}</b>
            {:else}
                <Post {postId} asLink />
            {/if}
        {/each}
    </Posts>
</div>

<style>
    div {
        display: grid;
        gap: calc(var(--k-padding) * 3);
    }

    .loading {
        pointer-events: none;
    }
</style>
