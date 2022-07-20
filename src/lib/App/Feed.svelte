<script lang="ts">
    import { Feed, getFeed, TimelineId } from "$/tools/api/feed";
    import Post from "$lib/App/Post.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import KIntersectionObserver from "$lib/kicho-ui/components/KIntersectionObserver.svelte";
    import { BigNumber } from "ethers";
    import { writable } from "svelte/store";

    export let timelineIds: TimelineId[];
    let feed: Feed = null;
    $: postIds = feed?.postIds;

    async function refresh() {
        feed = await getFeed(timelineIds);
    }

    $: timelineIds, onTimelineIdChange();
    async function onTimelineIdChange() {
        await refresh();
    }

    let intersecting = false;
    let done = false;
    let active = false;
    $: !done && intersecting && !active && loop();
    async function loop() {
        active = true;
        while (!done && intersecting) {
            done = await feed.loadMore();
            // This is to see if there was an error instead of getting infinite loop
            await new Promise((r) => setTimeout(r, 100));
        }
        active = false;
    }

    $: newPostCount = /* feed?.newPostCount */ writable(BigNumber.from(0));
</script>

<div class="feed">
    {#if !feed}
        <Post postId={BigNumber.from(-1)} />
    {:else}
        <div class="refresh-button">
            <KButton title="Refresh" on:click={refresh} background={!$newPostCount.eq(0)} color="mode-pop">
                {$newPostCount.eq(0) ? "Up to date" : `Refresh (${$newPostCount.toString()} new)`}
            </KButton>
        </div>
        <slot postIds={$postIds} />
        {#if !done}
            <KIntersectionObserver bind:intersecting rootMargin="{window.visualViewport.height * 5}px 0px">
                <div />
            </KIntersectionObserver>
        {:else}
            <div class="end">•</div>
        {/if}
    {/if}
</div>

<style>
    .feed {
        display: grid;
        gap: calc(var(--k-padding) * 3);
        scroll-padding: calc(var(--k-padding) * 2);
    }

    .refresh-button {
        display: grid;
        place-items: center;
    }

    .end {
        display: grid;
        place-content: center;
        width: auto;
        margin: auto;
        padding: calc(var(--k-padding) * 1);
    }
</style>
