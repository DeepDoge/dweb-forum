<script lang="ts">
    import type { getTimeline } from "$/plugins/api";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
import KIntersectionObserver from "$lib/kicho-ui/components/KIntersectionObserver.svelte";
    export let timeline: Awaited<ReturnType<typeof getTimeline>>;
    $: postIndexes = timeline?.postIndexes;
</script>

{#if timeline}
    <KButton text on:click={async () => console.log(await timeline.loadNewer())}>Load Newer</KButton>
    <div class="posts">
        {#each $postIndexes as postIndex (postIndex.toString())}
            <slot {postIndex} />
        {/each}
    </div>
    <KIntersectionObserver on:change={async (intersecting) => intersecting && await timeline.loadMore()}>
        <KButton text on:click={async () => console.log(await timeline.loadMore())}>Load More</KButton>
    </KIntersectionObserver>
{/if}

<style>
    .posts {
        display: grid;
        gap: 1em;
    }
</style>
