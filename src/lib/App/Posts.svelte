<script lang="ts">
    import type { getTimeline } from "$/plugins/api";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import KIntersectionObserver from "$lib/kicho-ui/components/KIntersectionObserver.svelte";
    export let timeline: Awaited<ReturnType<typeof getTimeline>>;
    $: items = timeline?.items;
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
    <KIntersectionObserver on:change={async (intersecting) => intersecting && (await timeline.loadMore())}>
        <KButton text on:click={async () => console.log(await timeline.loadMore())}>Load More</KButton>
    </KIntersectionObserver>
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
