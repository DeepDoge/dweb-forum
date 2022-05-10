<script lang="ts">
    import { getTimeline } from "$/plugins/api";
import KButton from "$lib/kicho-ui/components/KButton.svelte";

    import Post from "./Post.svelte";

    export let timelineId: Parameters<typeof getTimeline>[0];
    let timeline: Awaited<ReturnType<typeof getTimeline>> = null;
    $: postIndexes = timeline?.postIndexes;
    $: timelineId && updateTimeline();
    async function updateTimeline() {
        timeline = await getTimeline(timelineId);
    }
</script>

<div class="posts">
    <KButton on:click={() => timeline.loadNewer()}>Load Newer</KButton>
    {#if postIndexes}
        {#each $postIndexes as postIndex (postIndex)}
            <Post {postIndex} />
        {/each}
    {/if}
    <KButton on:click={() => timeline.loadMore()}>Load More</KButton>
</div>

<style>
    .posts {
        display: grid;
        gap: 2em;
    }
</style>
