<script lang="ts">
    import { getTimeline, TimelineId } from "$/plugins/api";
    import Post from "$lib/App/Post.svelte";
    import Posts from "$lib/App/Posts.svelte";
    import PublishPost from "./PublishPost.svelte";

    export let timelineId: TimelineId;

    $: timelinePromise = getTimeline(timelineId);
    $: timelinePromise?.then(async (timeline) => await timeline.loadNewer());
</script>

<PublishPost on:done={async () => (await timelinePromise).loadNewer()} {timelineId} />

{#await timelinePromise then timeline}
    <Posts {timeline} let:item>
        <div class="post">
            <Post postIndex={item.index} showReplies />
        </div>
    </Posts>
{/await}

<style>
    .post {
        display: grid;
        gap: var(--k-padding);
    }
</style>
