<script lang="ts">
    import type { getTimeline } from "$/plugins/api/timeline";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import KIntersectionObserver from "$lib/kicho-ui/components/KIntersectionObserver.svelte";
    export let timeline: Awaited<ReturnType<typeof getTimeline>>;
    $: items = timeline?.items;

    let bottomIntersecting: boolean;
    let bottomEnd = false;
    let bottomLoop = false;
    $: !bottomEnd && !bottomLoop && bottomIntersecting && onChange(bottomIntersecting);
    
    $: loadingBottom = timeline.loadMoreRunnning
    $: loadingTop = timeline.loadNewerRunning

    let lastLoadMoreResult: Awaited<ReturnType<typeof timeline['loadMore']>>
    async function onChange(value: typeof bottomIntersecting) {
        bottomLoop = true;
        while (bottomIntersecting) {
            lastLoadMoreResult = await timeline.loadMore()
            if (lastLoadMoreResult === false) {
                bottomEnd = true;
                break;
            }
            await new Promise((r) => setTimeout(r, 0));
        }
        bottomLoop = false;
    }
</script>

{#if timeline}
    <KButton text loading={$loadingTop} on:click={() => timeline.loadNewer()}>Load Newer</KButton>
    <div class="posts">
        {#each $items as item (item.index.toString())}
            <slot {item} />
        {/each}
    </div>
    {#if !bottomEnd}
        <KIntersectionObserver bind:intersecting={bottomIntersecting} rootMargin="{window.innerHeight * 5}px 0px">
            <KButton loading={$loadingBottom} text on:click={async () => (lastLoadMoreResult = await timeline.loadMore())}>Load More</KButton>
        </KIntersectionObserver>
    {:else}
        Reached to the END!
    {/if}
{/if}

<style>
    .posts {
        display: grid;
        gap: calc(var(--k-padding) * 2.9999999);
    }
</style>
