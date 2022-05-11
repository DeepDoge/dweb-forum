<script lang="ts">
    import { getTimeline } from "$/plugins/api";

    export let timelineId: Parameters<typeof getTimeline>[0];
    let timeline: Awaited<ReturnType<typeof getTimeline>> = null;
    $: postIndexes = timeline?.postIndexes;

    $: timelineId && updateTimeline();
    async function updateTimeline() {
        timeline = await getTimeline(timelineId);
    }
</script>

<slot {timeline} postIndexes={$postIndexes} />
