<script lang="ts">
    import { getTimeline } from "$/plugins/api";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";

    export let timelineId: Parameters<typeof getTimeline>[0];
    let timeline: Awaited<ReturnType<typeof getTimeline>> = null;

    $: postIndexes = timeline?.postIndexes;
    $: timelineId && updateTimeline();
    async function updateTimeline() {
        timeline = await getTimeline(timelineId);
    }
</script>

<div class="posts">
    <KButton on:click={async () => console.log(await timeline.loadNewer())}>Load Newer</KButton>
    {#if postIndexes}
        {#each $postIndexes as postIndex (postIndex)}
            <slot {postIndex}></slot>
        {/each}
    {/if}
    <KButton on:click={async () => console.log(await timeline.loadMore())}>Load More</KButton>
</div>

<style>
    .posts {
        display: grid;
        gap: 2em;
    }
</style>
