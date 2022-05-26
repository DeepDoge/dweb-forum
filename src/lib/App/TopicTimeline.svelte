<script lang="ts">
    import { bigNumberToString, stringToBigNumber } from "$/plugins/common/stringToBigNumber";

    import Timeline from "./Timeline.svelte";

    type TimelineProps = Timeline["$$prop_def"];
    interface $$Props extends Omit<TimelineProps, "timelineId"> {
        topic: string;
    }

    export let topic: $$Props["topic"];
    $: topicId = stringToBigNumber(topic);
</script>

<Timeline timelineId={{ group: 0, id: topicId }} />
