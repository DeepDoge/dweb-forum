<script lang="ts">
    import { getPost, getTimeline, TimelineId } from "$/plugins/api";
    import KBoxEffect from "$lib/kicho-ui/components/effects/KBoxEffect.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import AddressOf from "./AddressOf.svelte";
    import ClaimedNameOf from "./ClaimedNameOf.svelte";

    export let postIndex: Parameters<typeof getPost>[0];
    export let showReplies = false;

    let post: Awaited<ReturnType<typeof getPost>> = null;
    let repliesTimelineId: TimelineId;
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
        <KBoxEffect color="mode" background blur {loading} hideContent={loading}>
            <div class="post-inner">
                <div class="avatar" />
                <div class="name">
                    <ClaimedNameOf address={$post?.owner} />
                </div>
                <div class="address">
                    <AddressOf address={$post?.owner} />
                </div>
                <div class="date-time text-inline">
                    <span class="date text-inline">{date?.toLocaleString()}</span>
                </div>
                <div class="content text-multiline">
                    <p>{$post?.content}</p>
                </div>
            </div>
        </KBoxEffect>
    </div>
    {#if showReplies && $replies?.length > 0}
        <div class="replies">
            {#each $replies as item (item.index.toString())}
                <svelte:self postIndex={item.index} />
            {/each}
        </div>
        <div class="show-in-thread-button">
            <KButton text>Show in thread</KButton>
        </div>
    {/if}
</article>

<style>
    article {
        display: grid;
        gap: calc(var(--k-padding) * 2);
    }

    .show-in-thread-button {
        display: grid;
        justify-content: center;
    }

    .post {
        padding: calc(var(--k-padding) * 1.5);
    }

    .post-inner {
        display: grid;
        
        grid-template-columns: 2.5em auto 1fr auto;
        grid-template-areas:
            "avatar name address date-time"
            "avatar content content content";
        gap: 0.25em;

        align-items: center;
    }
    .replies {
        padding-left: calc(var(--k-padding) * 4);
    }

    .name {
        grid-area: name;
        display: grid;
        grid-auto-flow: column;
        justify-content: start;
        align-items: center;
        gap: var(--k-padding);
        font-weight: bold;
    }

    .avatar {
        grid-area: avatar;
        width: 100%;
        aspect-ratio: 1/1;
        border-radius: var(--k-border-radius-fab);
        background-image: var(--k-color-gradient);
        align-self: start;
    }

    .address {
        grid-area: address;
        font-size: var(--k-font-x-smaller);
        filter: opacity(0.5);
    }

    .date-time {
        grid-area: date-time;
        font-size: var(--k-font-xx-smaller);
    }

    .content {
        grid-area: content;
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
    }
</style>
