<script lang="ts">
    import { getTimeline, TimelineId } from "$/plugins/api/timeline";
    import { currentRoute } from "$/routes/_routing.svelte";
    import Post from "$lib/App/Post.svelte";
    import Posts from "$lib/App/Posts.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import { BigNumber } from "ethers";
    import PostReplyTimeline from "./PostReplyTimeline.svelte";

    export let timelineId: TimelineId;

    let selectedPostId: BigNumber = null;
    $: selectedPostId = $currentRoute.hash ? (/[0-9]/.test($currentRoute.hash) ? BigNumber.from($currentRoute.hash) : selectedPostId) : null;
    $: timelinePromise = getTimeline({ timelineId });

    
    let fixed = false;
    async function updateFixed() {
        fixed = selectedPostId && window.innerWidth <= 800
        document.body.style.overflow = fixed ? "hidden" : null;
    }
    $: updateFixed() && selectedPostId;
</script>

<svelte:window on:resize={updateFixed} />

<div class="grid">
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
        <div class="post" class:fixed>
            <div class="sticky">
                <header>
                    <slot name="post-header">
                        {#if $currentRoute.path}
                            <KButton size="smaller" color="mode-pop" href="#{$currentRoute.path}">
                                {"← Back"}
                            </KButton>
                        {/if}
                        <h2 aria-label="post timeline">Post</h2>
                    </slot>
                </header>
                <div class="posts k-slim-scrollbar">
                    <!-- on:scroll={() => window.scrollTo(0, window.innerHeight * 2)}> -->
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
        gap: calc(var(--k-padding) * 2);
        padding: calc(var(--k-padding) * 2);
        background-attachment: fixed;
        background-color: var(--k-color-body);
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

    .post.fixed {
        position: fixed;
        inset: 0;
        background-color: var(--k-color-body);
        z-index: 1;
    }

    .post header {
        justify-content: start;
    }

    .post .posts {
        height: 100%;
        overflow-y: auto;
    }
</style>
