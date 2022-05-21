<script lang="ts">
    import { getTimeline, TimelineId } from "$/plugins/api";
    import Post from "$lib/App/Post.svelte";
    import Posts from "$lib/App/Posts.svelte";

    let timelineId: TimelineId = { idType: 0, id: 0 }

    $: timelinePromise = getTimeline(timelineId);
    $: timelinePromise?.then(async (timeline) => await timeline.loadNewer())
</script>


<div id="page">
    {#await timelinePromise then timeline}
        <Posts {timeline} let:item>
            <div class="post">
                <Post postIndex={item.index} timelineId={timelineId} timelinePostIndex={item.timelinePostIndex} showReplies />
            </div>
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

    .post {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: var(--k-padding);
    }

    .post::before {
        content: "‣";
        font-size: var(--k-font-xx-larger);
    }
</style>
