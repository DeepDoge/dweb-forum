<script lang="ts">
    import { currentRoute } from "$/routes/_routing";

    import { Feed, getPostRoot, PostId, TimelineGroup, TimelineId } from "$/api/feed";
    import { bigNumberAsUtf8 } from "$/utils/bytes";
    import { promiseQueue } from "$/utils/common/promiseQueue";
    import Post from "$lib/App/Post.svelte";
    import Timeline from "$lib/App/Timeline.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import { globalDialogManager } from "$lib/kicho-ui/components/KDialog.svelte";
    import { BigNumber } from "ethers";
    import KSpinner from "$lib/kicho-ui/components/KSpinner.svelte";

    export let postId: PostId;

    let repliesTimelineId: TimelineId = null;
    let repliesFeed: Feed = null;
    let rootPostIds: PostId[] = [];

    let cache: typeof postId = BigNumber.from(-1)
    $: updateReplies(postId);
    const updateReplies = promiseQueue(async (value: PostId) => {
        if (value.eq(cache)) return
        cache = value
        if (!value.eq(postId)) return;
        try {
            repliesTimelineId = { group: TimelineGroup.Replies, key: postId };
            const root = await getPostRoot({ postId: value });
            if (!value.eq(postId)) return;
            rootPostIds = [...root, value];
            setTimeout(() => setTimeout(() => rootPostElements[postId._hex].scrollIntoView({ block: "nearest", inline: "nearest" })));

            await repliesFeed.ready;
            if (!value.eq(postId)) return;
            setTimeout(() => rootPostElements[postId._hex].scrollIntoView({ block: "nearest", inline: "nearest" }));
        } catch (error) {
            console.log(error);
            await globalDialogManager.alert("There was an error reaching the post timeline. See console for details.", "error");
        }
    });

    const rootPostElements: Record<string, HTMLElement> = {};
</script>

<div class="post-reply-timeline">
    <div class="posts">
        {#if postId && rootPostIds.length === 0}
            <Post postId={BigNumber.from(-1)} />
        {/if}
        {#each rootPostIds as timelinePostId (timelinePostId._hex)}
            <div bind:this={rootPostElements[timelinePostId._hex]} class="post root-post">
                <Post postId={timelinePostId} fullHeight={timelinePostId.eq(postId)}>
                    <svelte:fragment slot="before" let:postData>
                        {#if postData?.timelineGroup.eq(TimelineGroup.Topics)}
                            <div class="topic-button">
                                <KButton size="normal" color="master" href="#{$currentRoute.chainId}#{bigNumberAsUtf8(postData.timelineKey)}">
                                    #{bigNumberAsUtf8(postData.timelineKey)}
                                </KButton>
                                <div>⌄</div>
                            </div>
                        {/if}
                    </svelte:fragment>
                </Post>
            </div>
        {/each}
        <b>Replies:</b>
        {#if repliesTimelineId}
            <Timeline bind:feed={repliesFeed} timelineId={repliesTimelineId} let:postIds>
                {#each postIds as timelinePostId (timelinePostId._hex)}
                    <div class="post">
                        <Post postId={timelinePostId} />
                    </div>
                {/each}
            </Timeline>
        {:else}
            <KSpinner />
        {/if}
    </div>
</div>

<style>
    .topic-button {
        display: grid;
        place-items: center;
    }

    .root-post {
        display: grid;
        gap: calc(var(--k-padding) * 5);
    }

    .root-post + .root-post::before {
        content: "";
        position: absolute;
        border-left: dashed 0.15em var(--k-color-slave);
        height: var(--gap);
        transform: translateY(-100%) translateX(calc(var(--k-padding) * 5));
    }

    .post-reply-timeline {
        display: grid;
        gap: calc(var(--k-padding) * 5);
    }

    .posts {
        display: grid;
        --gap: calc(var(--k-padding) * 3);
        gap: var(--gap);
    }
</style>
