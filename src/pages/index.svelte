<script lang="ts">
    import { TimelineGroup } from "$/tools/api/feed";
    import TimelinePage from "$lib/App/TimelinePage.svelte";
</script>

<TimelinePage timelineId={{ group: TimelineGroup.AllPostsInGroup, key: TimelineGroup.Topics }}>
    <svelte:fragment slot="timeline-header">
        <h2>All</h2>
    </svelte:fragment>
</TimelinePage>
