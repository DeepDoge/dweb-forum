<script>
    import { getTimeline } from "$/plugins/api";
    import Post from "$lib/App/Post.svelte";
    import Posts from "$lib/App/Posts.svelte";
</script>

<div id="page">
    {#await getTimeline({ idType: 0, id: 0 }) then timeline}
        <Posts {timeline} let:postIndex>
            <Post {postIndex} showReplies />
        </Posts>
    {/await}
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
