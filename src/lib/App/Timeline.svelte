<script lang="ts">
    import type { Feed as FeedType } from "$/tools/api/feed";
    import { TimelineGroup, TimelineId } from "$/tools/api/feed";
    import Feed from "./Feed.svelte";
    import PublishPost from "./PublishPost.svelte";

    export let timelineId: TimelineId;
    let feed: FeedType = null;

    let _feed: typeof feed = null;
    $: _feed = feed;
    export { _feed as feed };
</script>

<div class="timeline">
    {#if timelineId.group > TimelineGroup.LastInternal}
        <PublishPost {timelineId} />
    {/if}
    <Feed bind:feed timelineIds={[timelineId]} let:postIds>
        <slot {postIds} />
    </Feed>
</div>

<style>
    .timeline {
        display: grid;
        gap: calc(var(--k-padding) * 4);
    }
</style>
