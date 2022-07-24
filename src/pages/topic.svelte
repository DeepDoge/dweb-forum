<script lang="ts">
    import { TimelineGroup, TimelineId } from "$/tools/api/feed";
    import { utf8AsBigNumber256 } from "$/utils/bytes";
    import { pageTitle } from "$/utils/pageTitle";
    import TimelinePage from "$lib/App/TimelinePage.svelte";

    export let topic: string;

    $: topicId = utf8AsBigNumber256(topic);
    let timelineId: TimelineId;
    $: timelineId = { group: TimelineGroup.Topics, key: topicId };
</script>

<svelte:head>
    <title>{pageTitle(`#${topic}`)}</title>
</svelte:head>

<TimelinePage {timelineId}>
    <svelte:fragment slot="timeline-header">
        <h2>Topic: #{topic}</h2>
    </svelte:fragment>
</TimelinePage>
