<script>
    import PostsOfAll from "$lib/App/PostsOfAll.svelte";
</script>

<div id="page">
    <PostsOfAll />
</div>

<style>
    #page {
        display: grid;
        grid-auto-flow: row;
        grid-template-columns: 1fr;
        gap: 0.5em;
    }
</style>
