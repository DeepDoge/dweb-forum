<script lang="ts">
    import { getTimeline, TimelineId } from "$/plugins/api/timeline";
    import Post from "$lib/App/Post.svelte";
    import Posts from "$lib/App/Posts.svelte";
    import PublishPost from "./PublishPost.svelte";

    export let timelineId: TimelineId;

    $: timelinePromise = getTimeline(timelineId);
</script>

<div class="timeline">
<PublishPost {timelineId} />

{#await timelinePromise then timeline}
    <Posts {timeline} let:postId>
        <div class="post">
            <Post postId={postId} showReplies />
        </div>
    </Posts>
{/await}
</div>

<style>

    .timeline {
        display: grid;
        gap: calc(var(--k-padding) * 5);
    }

    .post {
        display: grid;
        gap: var(--k-padding);
    }
</style>
