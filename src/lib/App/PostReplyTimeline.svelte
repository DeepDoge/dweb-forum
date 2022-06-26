<script lang="ts">
    import { getPostRoot, getTimeline, Timeline, TimelineId } from "$/plugins/api/timeline";
    import { route } from "$/routes/_routing.svelte";
    import Post from "$lib/App/Post.svelte";
    import Posts from "$lib/App/Posts.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import { BigNumber } from "ethers";
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

        const [root, timeline] = await Promise.all([await getPostRoot({ postId }), await getTimeline({ timelineId: repliesTimelineId })]);
        // await timeline.loadMore();

        prefixPostIds = [...root, postId, BigNumber.from(0)];
        repliesTimeline = timeline;

        loading = false;
    }
</script>

<div class:loading class="post-reply-timeline">
    {#if $route.route}
        <div class="back-button">
            <KButton size="normal" color={$route.route.startsWith("0x") ? "slave" : "master"} href="#{$route.route}">
                {$route.route.startsWith('0x') ? $route.route : `#${$route.route}`}
            </KButton>
        </div>
    {/if}
    <div class="posts">
        {#if loading && prefixPostIds.length === 0}
            <Post postId={BigNumber.from(-1)} />
        {/if}
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
</div>

<style>
    .back-button {
        display: grid;
        justify-content: center;
        align-items: center;
    }

    .post-reply-timeline {
        display: grid;
        gap: calc(var(--k-padding) * 5);
    }

    .posts {
        display: grid;
        gap: calc(var(--k-padding) * 3);
    }

    .loading {
        opacity: 0.5;
    }
</style>
