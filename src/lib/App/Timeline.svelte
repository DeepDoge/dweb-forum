<script lang="ts">
    import { getTimeline, TimelineId } from "$/plugins/api/timeline";
    import { route } from "$/routes/_routing.svelte";
    import Post from "$lib/App/Post.svelte";
    import Posts from "$lib/App/Posts.svelte";
    import { BigNumber } from "ethers";
    import PostReplyTimeline from "./PostReplyTimeline.svelte";

    export let timelineId: TimelineId;

    $: selectedPostId = $route.hash ? (/[0-9]/.test($route.hash) ? BigNumber.from($route.hash) : selectedPostId) : null;
    $: timelinePromise = getTimeline({ timelineId });
</script>

<div class="grid" class:show-post={selectedPostId}>
    <div class="timeline">
        <header class="sticky">
            <slot name="timeline-header" />
        </header>
        <div class="posts">
            <slot />
            {#await timelinePromise}
                <Post postId={BigNumber.from(-1)} />
            {:then timeline}
                <Posts {timeline} let:postIds>
                    {#each postIds as postId (postId.toString())}
                        <Post {postId} asLink />
                    {/each}
                </Posts>
            {/await}
        </div>
    </div>
    {#if selectedPostId}
        <div class="post">
            <div class="sticky">
                <header>
                    <slot name="post-header">
                        <h2 aria-label="post timeline">Post</h2>
                    </slot>
                </header>
                <div class="posts k-slim-scrollbar">
                    <PostReplyTimeline postId={selectedPostId} />
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
        align-content: stretch;
        align-items: stretch;
        justify-items: stretch;
    }

    header {
        display: grid;
        grid-auto-flow: column;
        align-items: center;
        font-size: var(--k-font-larger);
        gap: calc(var(--k-padding) * 2);
        padding: calc(var(--k-padding) * 2);
        background-attachment: fixed;
        background-color: var(--k-color-body);
    }

    header > :global(*) {
        font-size: 1em;
    }

    .posts {
        padding: calc(var(--k-padding) * 2);
    }

    .sticky {
        position: sticky;
        top: 0;
        z-index: 1;
    }

    .timeline .posts {
        display: grid;
        gap: calc(var(--k-padding) * 3);
    }

    .post .sticky {
        display: grid;
        grid-template-rows: auto 1fr;
        height: 100vh;
    }

    .post header {
        justify-content: start;
    }

    .post .posts {
        height: 100%;
        overflow-y: auto;
    }

    @media only screen and (max-width: 700px) {
        .show-post .timeline {
            position: absolute;
            width: 0;
            height: 0;
            opacity: 0;
        }
    }
</style>
