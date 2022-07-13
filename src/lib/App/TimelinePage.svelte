<script lang="ts">
    import { currentRoute } from "$/routes/_routing.svelte";
    import { getTimeline, PostId, Timeline as TimelineType, TimelineId } from "$/tools/api/app";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import { BigNumber } from "ethers";
    import Post from "./Post.svelte";
    import PostTimeline from "./PostTimeline.svelte";
    import Timeline from "./Timeline.svelte";

    export let timelineId: TimelineId;
    let timeline: TimelineType = null;

    $: timelineId, onTimelineIdChange();
    async function onTimelineIdChange() {
        timeline = null;
        if (!timelineId) return;
        timeline = await getTimeline({ timelineId });
    }

    let selectedPostId: PostId = null;
    $: selectedPostId = $currentRoute.hash ? (/[0-9]/.test($currentRoute.hash) ? BigNumber.from($currentRoute.hash) : selectedPostId) : null;

    let fixed = false;
    async function updateFixed() {
        fixed = selectedPostId && window.innerWidth <= 800;
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
        <Timeline publish {timeline} let:postIds>
            {#each postIds as postId (postId.toString())}
                <a href={postId ? `#${$currentRoute.path}#${postId}` : null}>
                    <Post {postId} />
                </a>
            {/each}
        </Timeline>
    </div>
    {#if selectedPostId}
        <div class="post" class:fixed>
            <div class="sticky">
                <header>
                    <slot name="post-header">
                        {#if $currentRoute.path != null}
                            <KButton size="smaller" color="mode-pop" href="#{$currentRoute.path}">
                                {"← Back"}
                            </KButton>
                        {/if}
                        <h2 aria-label="post timeline">Post</h2>
                    </slot>
                </header>
                <div class="posts k-slim-scrollbar">
                    <PostTimeline postId={selectedPostId} />
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
        gap: calc(var(--k-padding) * 2);
    }

    header {
        display: grid;
        grid-auto-flow: column;
        align-items: center;
        gap: calc(var(--k-padding) * 2);
        padding: calc(var(--k-padding) * 2);
        background-attachment: fixed;
        background-color: var(--k-color-mode-body);

        filter: opacity(.9);
    }

    .timeline,
    .post .posts {
        padding: calc(var(--k-padding) * 2);
    }

    .sticky {
        position: sticky;
        top: var(--header-height);
        z-index: var(--k-z-index-sticky);
    }

    .post .sticky {
        display: grid;
        grid-template-rows: auto 1fr;
        height: calc(100vh - var(--header-height));
    }

    .post.fixed {
        position: fixed;
        inset: 0;
        top: var(--header-height);
        background-color: var(--k-color-mode-body);
        z-index: var(--k-z-index-sticky);
    }

    .post header {
        justify-content: start;
    }

    .post .posts {
        height: 100%;
        overflow-y: auto;
        scroll-padding: calc(var(--k-padding) * 2);
    }

    .post .posts::after {
        content: "";
        display: block;
        height: 100%;
    }
</style>
