<script lang="ts">
    import PostsOfAll from "$lib/App/PostsOfAll.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";

    let value = 1;
    setInterval(() => value++);
</script>

<div id="page">
</div>

<style>
    #page {
        display: grid;
        grid-auto-flow: row;
        grid-template-columns: 1fr;
        gap: 0.5em;
    }
</style>
