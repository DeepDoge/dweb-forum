<script context="module" lang="ts">
    import Post from "$lib/App/Post.svelte";
    import TopicTimeline from "$lib/App/TopicTimeline.svelte";
    import KKeepAlive from "$lib/kicho-ui/components/KKeepAlive.svelte";
    import type { BigNumber } from "ethers";
    import { writable } from "svelte/store";

    export const currentTopic = writable<string>(null);
</script>

<script lang="ts">
    export let topic: string;
    export let postId: BigNumber = null;

    let el: HTMLDivElement = null;

    $: currentTopic.set(topic);

    const scrollToView = () => {
        setTimeout(() => {
            const rect = el.getBoundingClientRect();
            const scrollingBody = document.scrollingElement ?? document.body;
            scrollTo({ top: rect.top + scrollingBody.scrollTop, left: rect.left + scrollingBody.scrollLeft, behavior: "smooth" });

            if (postId.lt(0)) return;
            const postRect = slaveElement.querySelector(`#post${postId}`).getBoundingClientRect();
            const slaveRect = slaveElement.getBoundingClientRect();
            slaveElement.scrollTo({
                top: postRect.top + slaveElement.scrollTop - slaveRect.top,
                left: postRect.left + slaveElement.scrollLeft - slaveRect.left,
            });
        }, 500);
    };

    let slaveElement: HTMLDivElement;
</script>

<div bind:this={el} class="page" on:mousedown={scrollToView}>
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
                <div bind:this={slaveElement} class="scroll k-slim-scrollbar">
                    <!-- <KKeepAlive
                        value={{
                            component: Post,
                            key: postId.toHexString(),
                            props: {
                                postId,
                                showParent: true,
                                showReplies: true,
                            },
                        }}
                    /> -->
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

    .slave .scroll::after {
        content: "";
        display: block;
        height: 100%;
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
