<script lang="ts">
    import { getPostData, getTimeline, PostData, Timeline, TimelineGroup, TimelineId } from "$/plugins/api/app";
    import { second } from "$/plugins/utils/second";
    import { decodeBigNumberArrayToString } from "$/plugins/utils/stringToBigNumber";
    import { currentRoute } from "$/routes/_routing.svelte";
    import KBoxEffect from "$lib/kicho-ui/components/effects/KBoxEffect.svelte";
    import KChip from "$lib/kicho-ui/components/KChip.svelte";
    import KHoverMenu from "$lib/kicho-ui/components/KHoverMenu.svelte";
    import type { BigNumber } from "ethers";
    import type { Writable } from "svelte/store";
    import { format } from "timeago.js";
    import AvatarOf from "./AvatarOf.svelte";
    import Content from "./Content.svelte";
    import NicknameOf from "./NicknameOf.svelte";
    import ProfileMiniCard from "./ProfileMiniCard.svelte";

    type BoxProps = KBoxEffect["$$prop_def"];
    interface $$Props extends BoxProps {
        postId: BigNumber;
    }

    export let postId: BigNumber;

    let postData: Writable<PostData> = null;
    $: postContent = $postData ? decodeBigNumberArrayToString($postData.post.content) : null;

    let parentPostData: Writable<PostData> = null;

    let repliesTimelineId: TimelineId;
    $: repliesTimelineId = { group: TimelineGroup.Replies, id: postId };

    let repliesTimeline: Timeline = null;
    $: repliesLength = repliesTimeline?.length;

    $: postId?.toString() != $postData?.id.toString() && updatePost();
    async function updatePost() {
        postData = null;
        repliesTimeline = null;
        parentPostData = null;
        if (postId.lt(0)) return;
        postData = await getPostData({ postId });
        if ($postData.post.timelineGroup.eq(TimelineGroup.Replies)) parentPostData = await getPostData({ postId: $postData.post.timelineId });
        repliesTimeline = await getTimeline({ timelineId: repliesTimelineId });
    }

    $: date = $second && ((postData && format(new Date($postData.post.time.toNumber() * 1000))) ?? null);
    $: title = (postData && decodeBigNumberArrayToString([$postData.post.title])) ?? null;
    $: loading = postId && !postData;
    $: selected = /[0-9]/.test($currentRoute.hash) && postId?.eq($currentRoute.hash);
</script>

<slot name="before" postData={$postData}></slot>
<article>
    <div class="post">
        <KBoxEffect color="mode" radius="rounded" background {loading} hideContent={loading} glow={selected ? "master" : false} {...$$props}>
            <div class="inner">
                <div class="avatar">
                    <AvatarOf address={$postData?.post.owner} />
                </div>
                <a href="#{$postData?.post.owner}" class="nickname">
                    <NicknameOf address={$postData?.post.owner} />
                    <KHoverMenu background direction="right">
                        <ProfileMiniCard address={$postData?.post.owner} />
                    </KHoverMenu>
                </a>
                <div class="chip">
                    {#if parentPostData}
                        <a href="#{$currentRoute.path}#{$parentPostData.id}">
                            <KChip color="slave"
                                ><div class="k-text-singleline">Reply to:</div>
                                <NicknameOf address={$parentPostData.post.owner} /> @{$postData.post.timelineId}</KChip
                            >
                        </a>
                    {:else if $postData?.post.timelineGroup.eq(TimelineGroup.Topics)}
                        <a href="#{decodeBigNumberArrayToString([$postData.post.timelineId])}#{$postData.id}">
                            <KChip>#{decodeBigNumberArrayToString([$postData.post.timelineId])}</KChip>
                        </a>
                    {/if}
                    <div>
                        <KChip color="mode-pop">@{$postData?.id}</KChip>
                    </div>
                </div>

                {#if title}
                    <div class="title">
                        {title}
                    </div>
                {/if}
                <div class="content k-text-multiline">
                    {#if $postData}
                        <Content mentions={$postData.post.mentions} content={postContent} />
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
    </div>
</article>
<slot name="after" postData={$postData}></slot>

<style>
    article {
        display: grid;
        align-items: start;
        align-content: start;
        gap: calc(var(--k-padding) * 3);
    }
    .post {
        transition: var(--k-transition);
        transition-property: transform;
    }

    /*  .post:hover {
        transform: translateY(-0.1rem) scale(1.005);
    } disabled because cancels z-index */

    .post .inner {
        display: grid;
        grid-template-columns: 2ch auto 1fr auto;
        align-items: center;
        grid-template-areas:
            "avatar nickname . chip"
            "title title title title"
            "content content content content"
            "footer footer footer footer";
        gap: calc(var(--k-padding) * 1.25);
        padding: calc(var(--k-padding) * 2) calc(var(--k-padding) * 3);
    }

    .avatar {
        grid-area: avatar;
    }

    .nickname {
        grid-area: nickname;
        font-size: var(--k-font-x-smaller);
    }

    .chip {
        grid-area: chip;
        display: grid;
        grid-auto-flow: column;
        align-items: center;
        gap: 0.5ch;
    }

    .title {
        grid-area: title;
        font-weight: bold;
        font-size: var(--k-font-x-larger);
    }

    .content {
        grid-area: content;
        font-size: var(--k-font-larger);
        padding: calc(var(--k-padding) * 2) 0;
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
</style>
