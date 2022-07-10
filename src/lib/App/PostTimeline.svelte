<script lang="ts">
    import { currentRoute } from "$/routes/_routing.svelte";
    import { getPostRoot, getTimeline, PostId, Timeline as TimelineType, TimelineGroup, TimelineId } from "$/tools/api/app";
    import { bigNumberAsUtf8 } from "$/utils/bytes";
    import Post from "$lib/App/Post.svelte";
    import Timeline from "$lib/App/Timeline.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import { BigNumber } from "ethers";

    export let postId: PostId;

    let repliesTimelineId: TimelineId;
    $: repliesTimelineId = postId ? { group: TimelineGroup.Replies, key: postId } : null;

    let repliesTimeline: TimelineType = null;
    $: repliesTimelineLoading = repliesTimeline?.loading;

    let prefixPostIds: PostId[] = [];

    let loading = false;
    let _loading = loading;
    $: _loading = loading;
    export { _loading as loading };

    $: repliesTimelineId && updateReplies();
    async function updateReplies() {
        if (loading) return;
        loading = true;

        const [root, timeline] = await Promise.all([await getPostRoot({ postId }), await getTimeline({ timelineId: repliesTimelineId })]);

        await timeline.loadOlder();

        prefixPostIds = [...root, postId];
        repliesTimeline = timeline;

        loading = false;
    }

    function scrollIntoViewIfNeeded(target: HTMLElement) {
        if (!target) return;
        if (target.getBoundingClientRect().bottom > window.innerHeight) target.scrollIntoView(false);
        if (target.getBoundingClientRect().top < 0) target.scrollIntoView();
    }

    function scrollToPost()
    {
        scrollIntoViewIfNeeded(postElements[postId.toString()]);
    }

    const postElements: Record<string, HTMLElement> = {};
        $: currentPostsElement = postElements[postId.toString()]
    let cache = null
    $: (() => {
        if (cache === currentPostsElement) return
        cache = currentPostsElement
        scrollToPost()
    })()
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
                    <Post postId={timelinePostId}>
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
            <Timeline publish timeline={repliesTimeline} let:postIds>
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
    }
</style>
