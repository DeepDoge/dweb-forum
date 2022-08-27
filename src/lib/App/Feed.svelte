<script lang="ts">
    import { Feed, getFeed, TimelineId } from "$/api/feed";
    import { createTheThingThatLetsYouInitializeAndFinalize_A_ValueWhenItsSetAndSomeBooelanIsTrue } from "$/utils/thing";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import KIntersectionObserver from "$lib/kicho-ui/components/KIntersectionObserver.svelte";
    import KSpinner from "$lib/kicho-ui/components/KSpinner.svelte";

    export let timelineIds: TimelineId[];
    let feed: Feed;
    let postIds: Feed["postIds"];
    let newPostCount: Feed["newPostCount"];

    $: timelineIds, onTimelineIdsChange();
    function onTimelineIdsChange() {
        feed = getFeed(timelineIds);
        postIds = feed.postIds;
        newPostCount = feed.newPostCount;
        done = false;
        active = false;
    }

    $: isReady = done || $postIds?.length > 0;

    let _feed: typeof feed = null;
    $: _feed = feed;
    export { _feed as feed };

    function refresh() {
        timelineIds = [...timelineIds];
        done = false;
    }

    let intersectingBottom = false;
    let done = false;
    let active = true;
    $: !done && intersectingBottom && !active && loop(feed);
    async function loop(feedCache: typeof feed) {
        active = true;

        while (!done && intersectingBottom) {
            const result = await feedCache.loadMore();
            if (feedCache !== feed) return;
            done = result;

            await new Promise((r) => setTimeout(r, 100));
            if (feedCache !== feed) return;
        }

        active = false;
    }

    let intersectingTop = false;
    $: listen = intersectingTop;

    const thing = createTheThingThatLetsYouInitializeAndFinalize_A_ValueWhenItsSetAndSomeBooelanIsTrue<typeof feed>({
        init(value) {
            value.listen();
        },
        dispose(value) {
            value.unlisten();
        },
    });
    $: thing.update(listen, feed);
</script>

<div class="feed">
    <div class="refresh-button">
        {#key feed}
            <KIntersectionObserver bind:intersecting={intersectingTop}>
                <KButton title="Refresh" on:click={refresh} background={feed && !$newPostCount.eq(0)} color="mode-pop">
                    {#if !isReady}
                        <KSpinner />
                    {:else if $newPostCount.eq(0)}
                        Up to date
                    {:else}
                        Refresh ({$newPostCount.toString()} new)
                    {/if}
                </KButton>
            </KIntersectionObserver>
        {/key}
    </div>
    {#if feed}
        <slot postIds={$postIds} />
        {#if !done}
            <KIntersectionObserver bind:intersecting={intersectingBottom} rootMargin="{window.visualViewport.height * 5}px 0px">
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
