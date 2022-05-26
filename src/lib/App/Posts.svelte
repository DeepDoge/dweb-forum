<script lang="ts">
    import type { getTimeline } from "$/plugins/api";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import KIntersectionObserver from "$lib/kicho-ui/components/KIntersectionObserver.svelte";
    export let timeline: Awaited<ReturnType<typeof getTimeline>>;
    $: items = timeline?.items;

    let bottomIntersecting: boolean;
    let bottomEnd = false;
    let bottomLoop = false;
    $: !bottomEnd && !bottomLoop && bottomIntersecting && onChange(bottomIntersecting);
    async function onChange(value: typeof bottomIntersecting) {
        bottomLoop = true;
        while (bottomIntersecting) {
            const result = await timeline.loadMore();
            if (result === false) {
                bottomEnd = true;
                break;
            }
            await new Promise((r) => setTimeout(r, 0));
        }
        bottomLoop = false;
    }
</script>

{#if timeline}
    <KButton text on:click={async () => console.log(await timeline.loadNewer())}>Load Newer</KButton>
    <div class="posts">
        {#each $items as item (item.index.toString())}
            {#if item !== $items[0]}
                <div class="dots" />
            {/if}
            <slot {item} />
        {/each}
    </div>
    {#if !bottomEnd}
        <KIntersectionObserver bind:intersecting={bottomIntersecting}>
            <KButton loading={bottomLoop} text on:click={async () => console.log(await timeline.loadMore())}>Load More</KButton>
        </KIntersectionObserver>
    {:else}
        Reached to the END!
    {/if}
{/if}

<style>
    .posts {
        display: grid;
        gap: 1em;
    }

    .dots {
        display: grid;
        justify-items: center;
    }

    .dots::before {
        content: "⋮";
    }
</style>
