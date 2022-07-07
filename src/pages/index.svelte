<script lang="ts">
    import { TimelineGroup } from "$/tools/api/app";
    import TimelinePage from "$lib/App/TimelinePage.svelte";
</script>

<TimelinePage timelineId={{ group: TimelineGroup.AllPostsInGroup, id: TimelineGroup.Topics }}>
    <svelte:fragment slot="timeline-header">
        <h2>All</h2>
    </svelte:fragment>
</TimelinePage>
