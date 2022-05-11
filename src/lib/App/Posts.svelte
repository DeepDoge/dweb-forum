<script lang="ts">
    import type { getTimeline } from "$/plugins/api";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    export let timeline: Awaited<ReturnType<typeof getTimeline>>;
    $: postIndexes = timeline?.postIndexes;
</script>

{#if timeline}
    <KButton text on:click={async () => console.log(await timeline.loadNewer())}>Load Newer</KButton>
    <div class="posts">
        {#each $postIndexes as postIndex (postIndex)}
            <slot {postIndex} />
        {/each}
    </div>
    <KButton text on:click={async () => console.log(await timeline.loadMore())}>Load More</KButton>
{/if}

<style>
    .posts {
        display: grid;
        gap: 10em;
    }
</style>
