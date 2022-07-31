<script lang="ts">
import { currentRoute } from "$/routes/_routing";

    import { getPostData,getTimelineInfo,PostData,PostId,TimelineGroup } from "$/tools/api/feed";
    import { bigNumberAsUtf8,bytes32ToIpfsHash,hexToBytes } from "$/utils/bytes";
    import { promiseQueue } from "$/utils/common/promiseQueue";
    import { decodePostContentItems,getPostContentItemsDataFromIpfs,PostContentData } from "$/utils/content";
    import { second } from "$/utils/second";
    import KBoxEffect from "$lib/kicho-ui/components/effects/KBoxEffect.svelte";
    import KChip from "$lib/kicho-ui/components/KChip.svelte";
    import type { BigNumber } from "ethers";
    import type { Writable } from "svelte/store";
    import { format } from "timeago.js";
    import AddressOf from "./AddressOf.svelte";
    import AvatarOf from "./AvatarOf.svelte";
    import Content from "./Content.svelte";
    import NicknameOf from "./NicknameOf.svelte";

    type BoxProps = KBoxEffect["$$prop_def"];
    interface $$Props extends BoxProps {
        postId: PostId;
        fullHeight?: boolean;
    }

    export let postId: $$Props["postId"];
    export let fullHeight: $$Props["fullHeight"] = false;

    let postData: Writable<PostData> = null;
    let postContent: PostContentData = null;

    let parentPostData: Writable<PostData> = null;

    let repliesTimelineLength: Writable<BigNumber> = null;

    $: (!$postData || !postId.eq($postData.postId)) && updatePost();
    const updatePost = promiseQueue(async () => {
        postData = null;
        parentPostData = null;

        if (postId.lt(0)) return;

        await Promise.all([
            (async () => {
                postData = await getPostData(postId);
                await Promise.all([
                    (async () => {
                        const contentBytes = hexToBytes($postData.data);
                        postContent = $postData
                            ? {
                                  items:
                                      contentBytes[0] === 0
                                          ? await getPostContentItemsDataFromIpfs(bytes32ToIpfsHash(contentBytes.subarray(1)))
                                          : decodePostContentItems(contentBytes),
                                  mentions: $postData.mentions,
                              }
                            : null;
                    })(),
                    (async () => {
                        if ($postData.timelineGroup.eq(TimelineGroup.Replies)) parentPostData = await getPostData($postData.timelineKey);
                    })(),
                ]);
            })(),
            (async () => (repliesTimelineLength = (await getTimelineInfo({ group: TimelineGroup.Replies, key: postId })).length))(),
        ]);
    });

    $: date = $second && ((postData && format(new Date($postData.time.toNumber() * 1000))) ?? null);
    $: loading = postId && !postContent;
    $: selected = /^[0-9]+$/.test($currentRoute.hash) && postId?.eq($currentRoute.hash);
</script>

<slot name="before" postData={$postData} />
<article>
    <div class="post" class:limit-height={!fullHeight}>
        <KBoxEffect color="mode" radius="rounded" background {loading} hideContent={loading} glow={selected ? "master" : false} {...$$props}>
            <div class="inner">
                <div class="profile">
                    <div class="avatar">
                        <AvatarOf address={$postData?.owner} />
                    </div>
                    <a href="#{$currentRoute.chainId}#{$postData?.owner}" class="nickname">
                        <NicknameOf address={$postData?.owner} />
<!--                         <KHoverMenu background>
                            <ProfileMiniCard address={$postData?.owner} />
                        </KHoverMenu> -->
                    </a>
                    <div class="address">
                        <AddressOf address={$postData?.owner} />
                    </div>
                </div>

                <div class="chip">
                    {#if parentPostData}
                        <a href="#{$currentRoute.chainId}#{$currentRoute.path}#{$parentPostData.postId}">
                            <KChip color="slave">
                                <div class="k-text-singleline">Reply to:</div>
                                <NicknameOf address={$parentPostData.owner} /> @{$postData.timelineKey}
                            </KChip>
                        </a>
                    {:else if $postData?.timelineGroup.eq(TimelineGroup.Topics)}
                        <a href="#{$currentRoute.chainId}#{bigNumberAsUtf8($postData.timelineKey)}">
                            <KChip>#{bigNumberAsUtf8($postData.timelineKey)}</KChip>
                        </a>
                    {/if}
                    <div>
                        <KChip color="mode-pop">@{$postData?.postId}</KChip>
                    </div>
                </div>
                <a class="content k-text-multiline" draggable={selected ? 'false' : 'true'} href={postId ? `#${$currentRoute.chainId}#${$currentRoute.path}#${postId}` : null}>
                    {#if postContent}
                        <Content content={postContent} />
                    {:else}
                        ...
                    {/if}
                </a>

                <div class="footer">
                    <div class="reply-counter">
                        <svg aria-hidden="false" width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path
                                fill="currentColor"
                                d="M4.79805 3C3.80445 3 2.99805 3.8055 2.99805 4.8V15.6C2.99805 16.5936 3.80445 17.4 4.79805 17.4H7.49805V21L11.098 17.4H19.198C20.1925 17.4 20.998 16.5936 20.998 15.6V4.8C20.998 3.8055 20.1925 3 19.198 3H4.79805Z"
                            />
                        </svg>
                        {repliesTimelineLength ? $repliesTimelineLength : "..."}
                    </div>
                    <div class="date k-text-singleline">{date?.toLocaleString()}</div>
                </div>
            </div>
        </KBoxEffect>
    </div>
</article>
<slot name="after" postData={$postData} />

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
        grid-template-columns: auto 1fr auto;
        align-items: center;
        grid-template-areas:
            "profile . chip"
            "profile . chip"
            "title title title"
            "content content content"
            "footer footer footer";
        gap: calc(var(--k-padding) * 1.25);
        padding: calc(var(--k-padding) * 2) calc(var(--k-padding) * 3);
    }

    .profile {
        grid-area: profile;
        display: grid;
        grid-template-columns: 2.25ch var(--k-padding) auto;
        align-items: center;
        grid-template-areas:
            "avatar . nickname"
            "avatar . address";
    }

    .avatar {
        grid-area: avatar;
    }

    .nickname {
        grid-area: nickname;
        font-size: var(--k-font-x-smaller);
        font-weight: bold;
    }

    .address {
        grid-area: address;
        font-size: var(--k-font-xx-smaller);
    }

    .chip {
        grid-area: chip;
        display: grid;
        grid-auto-flow: column;
        align-items: center;
        gap: 0.5ch;
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
