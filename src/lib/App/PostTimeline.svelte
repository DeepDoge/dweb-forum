<script lang="ts">
    import type { PostType } from "./Post.svelte";
    import Post from "./Post.svelte";

    export let posts: PostType[];
</script>

<div class="posts">
    {#each posts as post (post.id)}
        <Post {post} />
    {/each}
</div>

<style>
    .posts {
        display: grid;
        gap: 2em;
    }
</style>
