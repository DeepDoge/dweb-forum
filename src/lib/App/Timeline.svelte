<script lang="ts">
    import { TimelineGroup, TimelineId } from "$/tools/api/feed";
    import Feed from "./Feed.svelte";
    import type { Feed as FeedType } from "$/tools/api/feed";
    import PublishPost from "./PublishPost.svelte";

    export let timelineId: TimelineId;
    let _feed: FeedType = null
    let feed: typeof _feed = null
    $: feed = _feed
    export { _feed as feed }
</script>

<div class="timeline">
    {#if timelineId.group > TimelineGroup.LastInternal}
        <PublishPost {timelineId} />
    {/if}
    <Feed bind:feed={_feed} timelineIds={[timelineId]} let:postIds>
        <slot {postIds} />
    </Feed>
</div>
