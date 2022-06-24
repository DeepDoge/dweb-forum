<script context="module" lang="ts">
    import Post from "$lib/App/Post.svelte";
    import TopicTimeline from "$lib/App/TopicTimeline.svelte";
    import type { BigNumber } from "ethers";
    import { writable } from "svelte/store";

    export const currentTopic = writable<string>(null);
</script>

<script lang="ts">
    export let topic: string;
    export let postId: BigNumber = null;

    $: currentTopic.set(topic);
</script>

<div class="page">
    <div class="container" class:has-post={postId}>
        <div class="master">
            <h2>Topic: #{topic}</h2>
            <div class="scroll k-slim-scrollbar">
                <TopicTimeline {topic} />
            </div>
        </div>
        {#if postId}
            <div class="slave">
                <h2>Post</h2>
                <div class="scroll k-slim-scrollbar">
                    <Post {postId} showParent showReplies />
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    .page {
        padding: var(--k-page-padding);
        display: grid;
        gap: calc(var(--k-padding) * 4);
    }

    .container {
        display: grid;
        grid-template-columns: 1fr;
        align-content: stretch;
        align-items: stretch;
        justify-items: stretch;
        gap: calc(var(--k-padding) * 4);
        height: calc(100vh - calc(var(--k-padding) * 2));
    }

    .has-post {
        grid-template-columns: 1fr 1fr;
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

    @media only screen and (max-width: 700px) {
        .has-post {
            grid-template-columns: 1fr;
        }
        .has-post .master {
            display: none;
        }
    }
</style>
