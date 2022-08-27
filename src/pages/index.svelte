<script lang="ts">
    import { TimelineGroup } from "$/api/feed";
    import { pageTitle } from "$/utils/pageTitle";
    import TimelinePage from "$lib/App/TimelinePage.svelte";

    export let active: boolean;
</script>

<svelte:head>
    {#if active}
        <title>{pageTitle("All")}</title>
    {/if}
</svelte:head>

<TimelinePage timelineId={{ group: TimelineGroup.AllPostsInGroup, key: TimelineGroup.Topics }}>
    <svelte:fragment slot="timeline-header">
        <h2>All</h2>
    </svelte:fragment>
</TimelinePage>
