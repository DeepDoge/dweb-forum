<script lang="ts">
    import type { getTimeline } from "$/plugins/api/app";
    import KIntersectionObserver from "$lib/kicho-ui/components/KIntersectionObserver.svelte";
    import { onDestroy, onMount } from "svelte";

    export let timeline: Awaited<ReturnType<typeof getTimeline>>;
    $: postIds = timeline.postIds;

    let bottomIntersecting = false;
    let bottomEnd = false;
    let bottomLoop = false;
    $: timeline && !bottomEnd && !bottomLoop && bottomIntersecting && onChange(bottomIntersecting);
    $: timeline && (bottomEnd = false);

    let lastLoadMoreResult: Awaited<ReturnType<typeof timeline["loadMore"]>>;
    async function onChange(value: typeof bottomIntersecting) {
        bottomLoop = true;
        while (bottomIntersecting) {
            lastLoadMoreResult = await timeline.loadMore();
            if (lastLoadMoreResult === false) {
                bottomEnd = true;
                break;
            }
            await new Promise((r) => setTimeout(r, 0));
        }
        bottomLoop = false;
    }

    $: onTimelineChange() && timeline
    let timelineCache: typeof timeline = null
    async function onTimelineChange()
    {
        timelineCache?.unlisten()
        timeline?.listen()

        timelineCache = timeline
    }

    onDestroy(() => timeline.unlisten());
</script>

<slot postIds={$postIds} />
{#if !bottomEnd}
    <KIntersectionObserver bind:intersecting={bottomIntersecting} rootMargin="{window.innerHeight * 5}px 0px">
        <div />
    </KIntersectionObserver>
{:else}
    <div class="end">•</div>
{/if}

<style>
    .end {
        display: grid;
        place-content: center;
        width: auto;
        margin: auto;
        padding: calc(var(--k-padding) * 1);
    }
</style>
