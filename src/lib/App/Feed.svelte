<script lang="ts">
    import { Feed, getFeed, TimelineId } from "$/tools/api/feed";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import KIntersectionObserver from "$lib/kicho-ui/components/KIntersectionObserver.svelte";
    import KSpinner from "$lib/kicho-ui/components/KSpinner.svelte";
    import { onDestroy } from "svelte";

    export let timelineIds: TimelineId[];
    let feed: Feed;
    let postIds: Feed["postIds"];
    let newPostCount: Feed["newPostCount"];

    $: timelineIds, onTimelineIdsChange();
    function onTimelineIdsChange() {
        feed?.unlisten();

        feed = getFeed(timelineIds);
        postIds = feed.postIds;
        newPostCount = feed.newPostCount;
        done = false;
        active = false;

        feed.listen();
    }
    onDestroy(() => feed?.unlisten());

    $: isReady = done || $postIds?.length > 0;

    let _feed: typeof feed = null;
    $: _feed = feed;
    export { _feed as feed };

    function refresh() {
        timelineIds = [...timelineIds];
        done = false;
    }

    let intersecting = false;
    let done = false;
    let active = true;
    $: !done && intersecting && !active && loop(feed);
    async function loop(feedCache: typeof feed) {
        active = true;

        while (!done && intersecting) {
            const result = await feedCache.loadMore();
            if (feedCache !== feed) return;
            done = result;

            await new Promise((r) => setTimeout(r, 100));
            if (feedCache !== feed) return;
        }

        active = false;
    }
</script>

<div class="feed">
    <div class="refresh-button">
        {#key feed}
            <KButton title="Refresh" on:click={refresh} background={feed && !$newPostCount.eq(0)} color="mode-pop">
                {#if !isReady}
                    <KSpinner />
                {:else if $newPostCount.eq(0)}
                    Up to date
                {:else}
                    Refresh ({$newPostCount.toString()} new)
                {/if}
            </KButton>
        {/key}
    </div>
    {#if feed}
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
