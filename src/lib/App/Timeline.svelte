<script lang="ts">
    import { Timeline, TimelineGroup } from "$/plugins/api/app";
    import Post from "$lib/App/Post.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import KIntersectionObserver from "$lib/kicho-ui/components/KIntersectionObserver.svelte";
    import { BigNumber } from "ethers";
    import { onDestroy } from "svelte";
    import PublishPost from "./PublishPost.svelte";

    export let publish = false
    export let timeline: Timeline;
    $: postIds = timeline?.postIds;

    let intersecting = false;
    let done = false;
    let active = false;
    $: !done && intersecting && !active && loop();
    async function loop() {
        active = true;
        while (!done && intersecting) {
            const isThereMoreToLoad = await timeline.loadOlder();
            done = !isThereMoreToLoad;
        }
        active = false;
    }
    $: timeline, onTimelineChange();
    let timelineCache: typeof timeline;
    function onTimelineChange() {
        const isNull = !timeline;
        timelineCache?.unlisten?.call(null);
        timeline?.listen?.call(null);
        timelineCache = timeline;
        setTimeout(() => done = isNull) // so fucking weird that i have to do this
    }
    onDestroy(() => timelineCache?.unlisten?.call(null));

    $: newPostCount = timeline?.newPostCount;
    function refresh() {
        const cache = timeline;
        timeline = null;
        setTimeout(() => (timeline = cache));
    }
</script>
<div class="timeline">
    <div class="posts">
        {#if publish && timeline?.timelineId.group > TimelineGroup.LastInternal}
            <PublishPost timelineId={timeline.timelineId} reply={timeline.timelineId.group === TimelineGroup.Replies} />
        {/if}
        {#if !timeline}
            <Post postId={BigNumber.from(-1)} />
        {:else}
            <div class="refresh-button">
                <KButton title="Refresh" on:click={refresh} background={!$newPostCount.eq(0)} color="mode-pop">
                    {$newPostCount.eq(0) ? "Up to date" : `Refresh (${$newPostCount.toString()} new)`}
                </KButton>
            </div>
            <slot postIds={$postIds} />
            {#if !done}
                <KIntersectionObserver bind:intersecting rootMargin="{window.innerHeight * 5}px 0px">
                    <div />
                </KIntersectionObserver>
            {:else}
                <div class="end">•</div>
            {/if}
        {/if}
    </div>
</div>

<style>
    .posts {
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
