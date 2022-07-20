<script lang="ts">
    import { TimelineGroup, TimelineId } from "$/tools/api/feed";
    import Feed from "./Feed.svelte";
    import PublishPost from "./PublishPost.svelte";

    export let timelineId: TimelineId;
</script>

<div class="timeline">
    {#if timelineId.group > TimelineGroup.LastInternal}
        <PublishPost {timelineId} />
    {/if}
    <Feed timelineIds={[timelineId]} let:postIds>
        <slot {postIds} />
    </Feed>
</div>
