<script lang="ts">
    import { getPost, getTimeline, TimelineId } from "$/plugins/api/timeline";
    import { second } from "$/plugins/common/second";
    import { bigNumberToString, decodePostContent } from "$/plugins/common/stringToBigNumber";
    import { currentTopicPost } from "$/routes/_routing.svelte";
    import KBoxEffect from "$lib/kicho-ui/components/effects/KBoxEffect.svelte";
    import KHoverMenu from "$lib/kicho-ui/components/KHoverMenu.svelte";
    import type { BigNumber } from "ethers";
    import { format } from "timeago.js";
    import AvatarOf from "./AvatarOf.svelte";
    import Content from "./Content.svelte";
    import NicknameOf from "./NicknameOf.svelte";
    import ProfileMiniCard from "./ProfileMiniCard.svelte";
    import PublishPost from "./PublishPost.svelte";
    import Timeline from "./Timeline.svelte";

    export let postId: BigNumber;
    export let showReplies = false;
    export let showParent = false;

    let postData: Awaited<ReturnType<typeof getPost>> = null;
    $: postContent = $postData ? decodePostContent($postData.post.content) : null;

    let repliesTimelineId: TimelineId;
    $: repliesTimelineId = { group: 3, id: postId };

    let repliesTimeline: Awaited<ReturnType<typeof getTimeline>> = null;
    $: repliesLength = repliesTimeline?.length;
    $: repliesLoading = repliesTimeline?.loading;

    $: postId?.toString() != $postData?.id.toString() && updatePost();
    async function updatePost() {
        postData = null;
        repliesTimeline = null;
        if (postId.lt(0)) return;
        postData = await getPost(postId);
        repliesTimeline = await getTimeline(repliesTimelineId);
    }

    $: date = $second && ((postData && format(new Date($postData.post.time.toNumber() * 1000))) ?? null);
    $: title = (postData && bigNumberToString($postData.post.title)) ?? null;
    $: loading = postId && !postData;
</script>

<article>
    {#if showParent && $postData?.post.timelineGroup.eq(3)}
        <div class="parent">
            <svelte:self showParent postId={$postData.post.timelineId} />
        </div>
    {/if}
    <a class="post" href={$currentTopicPost.topic && postId.gte(0) ? `##${$currentTopicPost.topic}:${postId}` : null}>
        <KBoxEffect
            color="mode"
            radius="rounded"
            background
            {loading}
            hideContent={loading}
            glow={$currentTopicPost.postId.eq(postId) ? "master" : false}
        >
            <div class="inner">
                {#if title}
                    <div class="title">
                        {title}
                    </div>
                {/if}

                <div class="avatar">
                    <AvatarOf address={$postData?.post.owner} />
                </div>
                <a href="#{$postData?.post.owner}" class="nickname">
                    <NicknameOf address={$postData?.post.owner} />
                    <KHoverMenu>
                        <ProfileMiniCard address={$postData?.post.owner} />
                    </KHoverMenu>
                </a>
                <div class="content k-text-multiline">
                    {#if $postData}
                        <Content content={postContent} />
                    {:else}
                        ...
                    {/if}
                </div>

                <div class="footer">
                    <div class="reply-counter">
                        <svg aria-hidden="false" width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path
                                fill="currentColor"
                                d="M4.79805 3C3.80445 3 2.99805 3.8055 2.99805 4.8V15.6C2.99805 16.5936 3.80445 17.4 4.79805 17.4H7.49805V21L11.098 17.4H19.198C20.1925 17.4 20.998 16.5936 20.998 15.6V4.8C20.998 3.8055 20.1925 3 19.198 3H4.79805Z"
                            />
                        </svg>
                        {$repliesLength ?? "..."}
                    </div>
                    <div class="date k-text-singleline">{date?.toLocaleString()}</div>
                </div>
            </div>
        </KBoxEffect>
    </a>
    {#if showReplies}
        <div class="replies">
            <PublishPost reply timelineId={repliesTimelineId} />
            <div class="replies-title">Replies{!repliesTimeline || $repliesLoading ? "..." : ":"}</div>
            <Timeline timelineId={repliesTimelineId} />
        </div>
    {/if}
</article>

<style>
    article {
        display: grid;
        align-items: start;
        align-content: start;
        gap: calc(var(--k-padding) * 3);
    }

    .parent::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: calc(var(--k-padding) * 5);
        height: calc(var(--k-padding) * 3);
        transform: translateY(100%);
        border-left: dashed 0.12em var(--k-color-slave);
    }

    .post {
        transition: var(--k-transition);
        transition-property: transform;
    }

    .post:hover {
        transform: translateY(-0.1rem) scale(1.005);
    }

    .post .inner {
        display: grid;
        grid-template-columns: 2ch auto 1fr;
        align-items: center;
        grid-template-areas:
            "avatar nickname ."
            "title title title"
            "content content content"
            "footer footer footer";
        gap: calc(var(--k-padding) * 1.25);
        padding: calc(var(--k-padding) * 2) calc(var(--k-padding) * 3);
    }

    .title {
        grid-area: title;
        font-weight: bold;
    }

    .avatar {
        grid-area: avatar;
    }

    .nickname {
        grid-area: nickname;
        font-size: var(--k-font-x-smaller);
    }

    .content {
        grid-area: content;
        font-size: smaller;
    }

    .footer {
        grid-area: footer;
        display: grid;
        grid-auto-flow: column;
        justify-content: space-between;
        align-items: center;
        font-size: var(--k-font-xx-smaller);
        gap: var(--k-padding);
    }

    .reply-counter {
        display: grid;
        grid-auto-flow: column;
        align-items: center;
        gap: 0.5ch;
    }

    .replies {
        display: grid;
        gap: calc(var(--k-padding) * 3);
    }

    .replies-title {
        font-size: var(--k-font-smaller);
        font-weight: bold;
    }
</style>
