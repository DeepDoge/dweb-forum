<script lang="ts">
    import { TimelineGroup } from "$/plugins/api/app";

    import { stringAsUint256 } from "$/plugins/utils/string";
    import TimelinePage from "./TimelinePage.svelte";

    type TimelineProps = TimelinePage["$$prop_def"];
    interface $$Props extends Omit<TimelineProps, "timelineId"> {
        topic: string;
    }

    export let topic: $$Props["topic"];
    $: topicId = stringAsUint256(topic);
    $: timelineId = { group: TimelineGroup.Topics, id: topicId };
</script>

<TimelinePage {timelineId}>
    <svelte:fragment slot="timeline-header">
        <h2>Topic: #{topic}</h2>
    </svelte:fragment>
</TimelinePage>
