<script lang="ts">
    import { stringToBigNumber } from "$/plugins/common/stringToBigNumber";
    import PublishPost from "./PublishPost.svelte";
    import Timeline from "./Timeline.svelte";
    
    type TimelineProps = Timeline["$$prop_def"];
    interface $$Props extends Omit<TimelineProps, "timelineId"> {
        topic: string;
    }

    export let topic: $$Props["topic"];
    $: topicId = stringToBigNumber(topic);
    $: timelineId = { group: 5, id: topicId };

    $: console.log(timelineId);
</script>

<div class="topic">
    <PublishPost {timelineId} />
    <Timeline {timelineId} />
</div>

<style>
    .topic {
        display: grid;
        gap: calc(var(--k-padding) * 3);
    }
</style>
