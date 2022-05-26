<script lang="ts">
    import { getPost,getTimeline, TimelineId } from "$/plugins/api";
    import KBoxEffect from "$lib/kicho-ui/components/effects/KBoxEffect.svelte";
    import ClaimedNameOf from "./ClaimedNameOf.svelte";

    export let postIndex: Parameters<typeof getPost>[0];
    export let showReplies = false;

    let post: Awaited<ReturnType<typeof getPost>> = null;
    let repliesTimelineId: TimelineId
    $: repliesTimelineId = { group: 1, id: postIndex };
    let repliesTimeline: Awaited<ReturnType<typeof getTimeline>> = null;
    $: replies = repliesTimeline?.items;
    $: postIndex?.toString() !== $post?.index.toString() && updatePost();
    $: !showReplies && (repliesTimeline = null);
    async function updatePost() {
        post = null;
        repliesTimeline = null;
        post = await getPost(postIndex);
        if (showReplies) await updateReplies();
    }
    async function updateReplies() {
        repliesTimeline = await getTimeline(repliesTimelineId);
        if (!(await repliesTimeline.loadNewer())) return;
        for (let i = 0; i < 3; i++) if (!(await repliesTimeline.loadMore())) return;
    }

    $: date = (post && new Date($post.publishTime.toNumber() * 1000)) ?? null;

    $: loading = postIndex && !post;
</script>

<article>
    <div class="post">
        <KBoxEffect radius="tile" {loading} hideContent={loading}>
            <header>
                <KBoxEffect color="gradient" background radius="tile">
                    <div class="name">
                        <ClaimedNameOf address={$post?.owner} />
                    </div>
                    <div class="date-time">
                        <span class="date text-inline">{date?.toLocaleString()}</span>
                    </div>
                </KBoxEffect>
            </header>
            <div class="content text-multiline">
                <KBoxEffect background blur radius="tile">
                <p>{$post?.content}</p>
            </KBoxEffect>
            </div>

            <div class="tags" />
        </KBoxEffect>
    </div>
    {#if showReplies && $replies?.length > 0}
        <div class="replies">
            {#each $replies as item (item.index.toString())}
                <svelte:self postIndex={item.index} />
            {/each}
        </div>
    {/if}
</article>

<style>
    article {
        display: grid;
        gap: calc(var(--k-padding) * 2);
    }

    .post {
        display: grid;
    }
    .replies {
        padding-left: calc(var(--k-padding) * 4);
    }

    header {
        display: grid;
        grid-template-columns: 1fr auto auto;
        align-items: center;
        --gap: var(--k-padding);
        gap: var(--gap);
        padding: 0 var(--k-padding);

        font-size: var(--k-font-smaller);
    }

    .name {
        font-weight: bold;
    }

    .date-time {
        font-size: var(--k-font-xx-smaller);
    }

    .content {
        display: box;
        display: -webkit-box;
        display: -moz-box;
        line-clamp: 3;
        -webkit-line-clamp: 8;
        box-orient: vertical;
        -webkit-box-orient: vertical;
        -moz-box-orient: vertical;
        overflow: hidden;
        font-size: var(--k-font-larger);
        padding: calc(var(--k-padding) * 1) calc(var(--k-padding) * 0.5);
    }

    .tags {
        display: grid;
        grid-auto-flow: column;
        gap: var(--k-padding);
        align-items: stretch;
        justify-content: start;
        font-size: var(--k-font-xx-smaller);
        overflow-x: auto;
        overflow-y: hidden;
    }
</style>
