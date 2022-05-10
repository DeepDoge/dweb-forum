<script>
    import Post from "$lib/App/Post.svelte";
    import PostTimeline from "$lib/App/PostTimeline.svelte";
</script>

<div id="page">
    <PostTimeline timelineId={{ id: 0, idType: 0 }} let:postIndex>
        <Post {postIndex} showReplies></Post>
    </PostTimeline>
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
