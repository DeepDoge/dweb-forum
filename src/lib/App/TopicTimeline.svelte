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
</script>

<Timeline {timelineId}>
    <svelte:fragment slot="timeline-header">
        <h2>Topic: #{topic}</h2>
    </svelte:fragment>
    <PublishPost {timelineId} />
</Timeline>
