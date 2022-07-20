<script lang="ts">
    import { currentRoute } from "$/routes/_routing.svelte";
    import { bigNumberAsUtf8 } from "$/utils/bytes";
    import { promiseQueue } from "$/utils/common/promiseQueue";
    import Post from "$lib/App/Post.svelte";
    import Timeline from "$lib/App/Timeline.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import { BigNumber } from "ethers";
    import { Feed, getFeed, getPostRoot, PostId, TimelineGroup } from "$/tools/api/feed";

    export let postId: PostId;

    let repliesTimeline: Feed = null;
    $: repliesTimelineLoading = repliesTimeline?.loading;
    let prefixPostIds: PostId[] = [];

    let loading = false;
    let _loading = loading;
    $: _loading = loading;
    export { _loading as loading };

    $: postId && updateReplies(postId);
    const updateReplies = promiseQueue(async (postId: PostId) => {
        if (loading) return;
        loading = true;

        const [root, timeline] = await Promise.all([
            await getPostRoot({ postId }),
            await getFeed([ { group: TimelineGroup.Replies, key: postId } ]),
        ]);

        await timeline.loadMore();

        prefixPostIds = [...root, postId];
        repliesTimeline = timeline;

        loading = false;
    });

    function scrollIntoViewIfNeeded(target: HTMLElement) {
        if (!target) return;
        if (target.getBoundingClientRect().bottom > window.innerHeight) target.scrollIntoView(false);
        if (target.getBoundingClientRect().top < 0) target.scrollIntoView();
    }

    function scrollToPost() {
        scrollIntoViewIfNeeded(postElements[postId.toString()]);
    }

    const postElements: Record<string, HTMLElement> = {};
    $: currentPostsElement = postElements[postId.toString()];
    let cache = null;
    $: (() => {
        if (cache === currentPostsElement) return;
        cache = currentPostsElement;
        scrollToPost();
    })();
</script>

<div class:loading class="post-reply-timeline">
    <div class="posts">
        {#if loading && prefixPostIds.length === 0}
            <Post postId={BigNumber.from(-1)} />
        {/if}
        {#if repliesTimeline}
            {#each prefixPostIds as timelinePostId (timelinePostId.toString())}
                <a
                    href={timelinePostId ? `#${$currentRoute.path}#${timelinePostId}` : null}
                    bind:this={postElements[timelinePostId.toString()]}
                    class="post root-post"
                >
                    <Post postId={timelinePostId} fullHeight={timelinePostId.eq(postId)}>
                        <svelte:fragment slot="before" let:postData>
                            {#if postData?.timelineGroup.eq(TimelineGroup.Topics)}
                                <div class="topic-button">
                                    <KButton size="normal" color="master" href="#{bigNumberAsUtf8(postData.timelineKey)}">
                                        #{bigNumberAsUtf8(postData.timelineKey)}
                                    </KButton>
                                    <div>⌄</div>
                                </div>
                            {/if}
                        </svelte:fragment>
                    </Post>
                </a>
            {/each}
            <b>Replies{$repliesTimelineLoading ? "..." : ":"}</b>
            <Timeline timelineId={{ group: TimelineGroup.Replies, key: postId }} let:postIds>
                {#each postIds as timelinePostId (timelinePostId.toString())}
                    <a
                        href={timelinePostId ? `#${$currentRoute.path}#${timelinePostId}` : null}
                        class="post"
                        bind:this={postElements[timelinePostId.toString()]}
                    >
                        <Post postId={timelinePostId} />
                    </a>
                {/each}
            </Timeline>
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

    .loading {
        opacity: 0.5;
        pointer-events: none;
    }
</style>
