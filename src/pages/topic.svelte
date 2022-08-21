<script lang="ts">
    import { TimelineGroup, TimelineId } from "$/tools/api/feed";
    import { utf8AsBigNumber256 } from "$/utils/bytes";
    import { pageTitle } from "$/utils/pageTitle";
    import TimelinePage from "$lib/App/TimelinePage.svelte";

    export let topic: string;

    $: topicId = utf8AsBigNumber256(topic);
    let timelineId: TimelineId;
    $: timelineId = { group: TimelineGroup.Topics, key: topicId };

    export let active: boolean;
</script>

<svelte:head>
    {#if active}
        <title>{pageTitle(`#${topic}`)}</title>
    {/if}
</svelte:head>

<TimelinePage {timelineId}>
    <svelte:fragment slot="timeline-header">
        <h2>Topic: #{topic}</h2>
    </svelte:fragment>
</TimelinePage>
