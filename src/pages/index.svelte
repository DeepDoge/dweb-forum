<script lang="ts">
    import { TimelineGroup } from "$/tools/api/feed";
    import { pageTitle } from "$/utils/pageTitle";
    import TimelinePage from "$lib/App/TimelinePage.svelte";
</script>

<svelte:head>
    <title>{pageTitle("All")}</title>
</svelte:head>

<TimelinePage timelineId={{ group: TimelineGroup.AllPostsInGroup, key: TimelineGroup.Topics }}>
    <svelte:fragment slot="timeline-header">
        <h2>All</h2>
    </svelte:fragment>
</TimelinePage>
