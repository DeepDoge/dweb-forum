<script>
    import PostsOfAll from "$lib/App/PostsOfAll.svelte";
    import PostTimeline from "$lib/App/PostTimeline.svelte";
</script>

<div id="page">
    <PostsOfAll let:posts>
        <PostTimeline {posts} />
    </PostsOfAll>
</div>

<style>
    #page {
        display: grid;
        grid-auto-flow: row;
        grid-template-columns: 1fr;
        gap: 0.5em;

        justify-content: center;
        grid-template-columns: min(30em, 100%);
    }
</style>
