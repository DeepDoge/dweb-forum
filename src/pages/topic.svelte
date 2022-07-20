<script lang="ts">
import { pageTitle } from "$/utils/pageTitle";

    import TopicTimeline from "$lib/App/TopicTimeline.svelte";
    export let topic: string;
</script>

<svelte:head>
    <title>{pageTitle(`#${topic}`)}</title>
</svelte:head>

<TopicTimeline {topic} />
