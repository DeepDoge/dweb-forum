<script lang="ts">
    import { getTimeline, TimelineId } from "$/plugins/api/timeline";
    import { route } from "$/routes/_routing.svelte";
    import Post from "$lib/App/Post.svelte";
    import Posts from "$lib/App/Posts.svelte";
    import { BigNumber } from "ethers";
    import PostReplyTimeline from "./PostReplyTimeline.svelte";

    export let timelineId: TimelineId;

    $: selectedPostId = /[0-9]/.test($route.hash) ? BigNumber.from($route.hash) : null;

    $: timelinePromise = getTimeline({ timelineId });
</script>

<div class="page">
    <div class="container" class:show-post={$route.hash}>
        <div class="master">
            <header>
                <slot name="timeline-header" />
            </header>
            <div class="scroll k-slim-scrollbar">
                <div class="timeline">
                    <slot />
                    {#await timelinePromise then timeline}
                        <Posts {timeline} let:postIds>
                            {#each postIds as postId (postId.toString())}
                                <Post {postId} asLink />
                            {/each}
                        </Posts>
                    {/await}
                </div>
            </div>
        </div>
        {#if /[0-9]/.test($route.hash)}
            <div class="slave">
                <header class="post-header">
                    <slot name="post-header">
                        <h2 aria-label="post timeline">Post</h2>
                    </slot>
                </header>
                <div class="scroll k-slim-scrollbar">
                    <PostReplyTimeline postId={selectedPostId} />
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    .page {
        display: grid;
        gap: calc(var(--k-padding) * 4);
    }

    .container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
        align-content: stretch;
        align-items: stretch;
        justify-items: stretch;
        height: 100vh;
    }

    .timeline {
        display: grid;
        gap: calc(var(--k-padding) * 3);
    }

    .container > * {
        display: grid;
        align-content: start;
    }

    .scroll {
        height: 100%;
        overflow-y: auto;
    }

    .scroll {
        padding: calc(var(--k-padding) * 2);
    }

    header > :global(*) {
        font-size: 1em;
    }

    header {
        display: grid;
        grid-auto-flow: column;
        align-items: center;
        font-size: var(--k-font-larger);
        gap: calc(var(--k-padding) * 2);
        padding: calc(var(--k-padding) * 2);
        background-attachment: fixed;
    }

    .post-header {
        justify-content: start;
    }

    @media only screen and (max-width: 700px) {
        .show-post .master {
            position: absolute;
            width: 0;
            height: 0;
            opacity: 0;
        }
    }
</style>
