<script lang="ts">
    import { getPost } from "$/plugins/api";
    import KBoxEffect from "$lib/kicho-ui/components/effects/KBoxEffect.svelte";
    import ClaimedNameOf from "./ClaimedNameOf.svelte";
    import Posts from "./Posts.svelte";
    import PostTimeline from "./PostTimeline.svelte";
    import ProfileInline from "./ProfileInline.svelte";

    export let postIndex: Parameters<typeof getPost>[0];
    export let showReplies = false;

    let post: Awaited<ReturnType<typeof getPost>> = null;
    $: postIndex && updatePost();
    async function updatePost() {
        post = await getPost(postIndex);
    }

    $: date = (post && new Date($post.publishTime.toNumber() * 1000)) ?? null;
</script>

{#if post}
    <article>
        <div class="post">
            <KBoxEffect border background glow radius="tile">
                <header>
                    <div class="name">
                        <ClaimedNameOf address={$post.owner} />
                    </div>
                    <div class="date-time">
                        <span class="date text-inline">{date.toDateString()} {date.toLocaleTimeString()}</span>
                    </div>
                </header>
                <hr />
                <div class="content text-multiline">
                    <p>{$post.content}</p>
                </div>

                <div class="tags" />
            </KBoxEffect>
        </div>
        {#if showReplies}
            <PostTimeline timelineId={{ idType: 1, id: postIndex }} let:postIndexes let:timeline>
                {#if postIndexes?.length > 0}
                    <div class="replies">
                        <Posts {timeline} let:postIndex>
                            <svelte:self {postIndex} />
                        </Posts>
                    </div>
                {/if}
            </PostTimeline>
        {/if}
    </article>
    <span class="dots">⋮</span>
{/if}

<style>
    article {
        display: grid;
        gap: calc(var(--k-padding) * 2);
    }

    article + .dots {
        text-align: center;
    }
    article:last-of-type + .dots {
        display: none;
    }

    /*     hr {
        background-image: var(--k-color-gradient);
    } */

    .post {
        display: grid;
        padding: calc(var(--k-padding) * 1);
    }
    .replies {
        padding-left: calc(var(--k-padding) * 4);
    }

    header {
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        gap: var(--k-padding);
    }

    .name {
        font-weight: bold;
    }

    .date-time {
        display: grid;
        justify-items: end;
        font-size: var(--k-font-xx-smaller);
        opacity: 0.75;
    }

    .content {
        display: box;
        display: -webkit-box;
        display: -moz-box;
        line-clamp: 3;
        -webkit-line-clamp: 8;
        box-orient: vertical;
        -webkit-box-orient: vertical;
        -moz-box-orient: vertical;
        overflow: hidden;

        padding: var(--k-padding);
    }

    .tags {
        display: grid;
        grid-auto-flow: column;
        gap: var(--k-padding);
        align-items: stretch;
        justify-content: start;
        font-size: var(--k-font-xx-smaller);
        overflow-x: auto;
        overflow-y: hidden;
    }
</style>
