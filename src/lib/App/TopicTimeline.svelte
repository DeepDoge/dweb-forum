<script lang="ts">
    import { stringToBigNumber } from "$/plugins/common/stringToBigNumber";
import { BigNumber } from "ethers";
    import Timeline from "./Timeline.svelte";

    type TimelineProps = Timeline["$$prop_def"];
    interface $$Props extends Omit<TimelineProps, "timelineId"> {
        topic: string;
    }

    export let topic: $$Props["topic"];
    $: topicId = stringToBigNumber(topic);
</script>

<Timeline timelineId={{ group: 5, id: topicId }} />
