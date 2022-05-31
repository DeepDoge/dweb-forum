<script lang="ts">
    import TopicTimeline from "$lib/App/TopicTimeline.svelte";
    import KPageContainer from "$lib/kicho-ui/components/KPageContainer.svelte";

    export let topic: string;
</script>

<KPageContainer>
    <h1>Topic: #{topic}</h1>
    <TopicTimeline {topic} />
</KPageContainer>
