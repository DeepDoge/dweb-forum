<script lang="ts">
    import TopicTimeline from "$lib/App/TopicTimeline.svelte";
import KBoxEffect from "$lib/kicho-ui/components/effects/KBoxEffect.svelte";
    import KPageContainer from "$lib/kicho-ui/components/KPageContainer.svelte";

    export let topic: string;
</script>

<KPageContainer>
    <div>
    <h1>Topic: #{topic}</h1>
    <TopicTimeline {topic} />
</div>
</KPageContainer>
<style>
    div {
        display: grid;
        gap: calc(var(--k-padding) * 4);
    }
</style>
