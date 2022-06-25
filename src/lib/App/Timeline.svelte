<script lang="ts">
    import { getTimeline, TimelineId } from "$/plugins/api/timeline";
    import { route } from "$/routes/_routing.svelte";
    import Post from "$lib/App/Post.svelte";
    import Posts from "$lib/App/Posts.svelte";
    import { BigNumber } from "ethers";
    import PostReplyTimeline from "./PostReplyTimeline.svelte";

    export let timelineId: TimelineId;

    $: selectedPostId = /[0-9]/.test($route.hash) ? BigNumber.from($route.hash) : null;

    $: timelinePromise = getTimeline(timelineId);
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
                <header>
                    <slot name="post-header">
                        <h2>Post</h2>
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
    .timeline {
        display: grid;
        gap: calc(var(--k-padding) * 3);
    }

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
        height: calc(100vh - calc(var(--k-padding) * 2));
    }

    .container > * {
        display: grid;
        grid-template-rows: auto 1fr;
        gap: calc(var(--k-padding) * 4);
    }

    .scroll {
        height: 100%;
        overflow-y: auto;
    }

    .scroll {
        padding: calc(var(--k-padding) * 2);
    }

    header {
        padding: 0 calc(var(--k-padding) * 2);
    }

    @media only screen and (max-width: 700px) {
        .show-post .master {
            display: none;
        }
    }
</style>
