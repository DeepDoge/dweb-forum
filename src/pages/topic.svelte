<script lang="ts">
    import { pageHash } from "$/routes/__layout.svelte";
    import TopicTimeline from "$lib/App/TopicTimeline.svelte";

    $: topic = $pageHash.startsWith("##") ? topic : $pageHash.substring(1);
</script>

<div id="page">
    <h1>Topic: #{topic}</h1>
    <TopicTimeline {topic} />
</div>

<style>
    #page {
        display: grid;
        grid-auto-flow: row;
        grid-template-columns: 1fr;
        gap: 0.5em;

        justify-content: center;
        grid-template-columns: min(50em, 100%);
    }
</style>
