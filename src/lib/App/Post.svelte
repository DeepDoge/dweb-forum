<script lang="ts">
    import { getPost, getTimeline, TimelineId } from "$/plugins/api/timeline";
    import { bigNumberToString, decodePostContent } from "$/plugins/common/stringToBigNumber";
    import KBoxEffect from "$lib/kicho-ui/components/effects/KBoxEffect.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import KHoverMenu from "$lib/kicho-ui/components/KHoverMenu.svelte";
    import type { BigNumber } from "ethers";
    import AvatarOf from "./AvatarOf.svelte";
    import Content from "./Content.svelte";
    import NicknameOf from "./NicknameOf.svelte";
    import ProfileMiniCard from "./ProfileMiniCard.svelte";
    import { format } from "timeago.js";
    import { second } from "$/plugins/common/second";

    export let postId: BigNumber;
    export let showReplies = false;

    let postData: Awaited<ReturnType<typeof getPost>> = null;
    $: postContent = $postData ? decodePostContent($postData.post.content) : null;

    let repliesTimelineId: TimelineId;
    $: repliesTimelineId = { group: 3, id: postId };

    let repliesTimeline: Awaited<ReturnType<typeof getTimeline>> = null;
    $: replies = repliesTimeline?.postIds;

    $: postId?.toString() != $postData?.id.toString() && updatePost();
    $: !showReplies && (repliesTimeline = null);
    async function updatePost() {
        postData = null;
        repliesTimeline = null;
        if (postId.lt(0)) return;
        postData = await getPost(postId);
        if (showReplies) await updateReplies();
    }
    async function updateReplies() {
        repliesTimeline = await getTimeline(repliesTimelineId);
    }

    $: date = $second && ((postData && format(new Date($postData.post.time.toNumber() * 1000))) ?? null);
    $: title = (postData && bigNumberToString($postData.post.title)) ?? null;
    $: loading = postId && !postData;
</script>

<article>
    <div class="post">
        <KBoxEffect color="mode" radius="rounded" background {loading} hideContent={loading}>
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

                <div class="date k-text-singleline">{date?.toLocaleString()}</div>
            </div>
        </KBoxEffect>
    </div>
    {#if showReplies && $replies?.length > 0}
        <div class="replies">
            {#each $replies as item (item.toString())}
                <svelte:self postIndex={item} />
            {/each}
        </div>
    {/if}
</article>

<style>
    article {
        display: grid;
        grid-template-rows: auto auto;
        align-items: start;
        align-content: start;
        gap: calc(var(--k-padding) * 0);
    }

    .post .inner {
        display: grid;
        grid-template-columns: var(--avatar-size) 1fr;
        grid-template-areas:
            "title title"
            "avatar nickname"
            "avatar content"
            "date date";
        gap: calc(var(--k-padding) * 2);
        padding: calc(var(--k-padding) * 2) calc(var(--k-padding) * 3);
    }

    .title {
        grid-area: title;
        font-size: var(--k-font-x-larger);
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
    }

    .date {
        grid-area: date;
        font-size: var(--k-font-xx-smaller);
        justify-self: end;
    }

    .replies {
        padding-left: calc(var(--k-padding) * 4);
    }
</style>
