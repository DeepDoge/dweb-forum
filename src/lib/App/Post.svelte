<script lang="ts">
    import { getPost,getTimeline,TimelineId } from "$/plugins/api/timeline";
    import { decodePostContent } from "$/plugins/common/stringToBigNumber";
    import KBoxEffect from "$lib/kicho-ui/components/effects/KBoxEffect.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import KHoverMenu from "$lib/kicho-ui/components/KHoverMenu.svelte";
    import type { BigNumber } from "ethers";
    import AvatarOf from "./AvatarOf.svelte";
    import Content from "./Content.svelte";
    import NicknameOf from "./NicknameOf.svelte";
    import ProfileMiniCard from "./ProfileMiniCard.svelte";

    export let postId: BigNumber;
    export let showReplies = false;

    let postData: Awaited<ReturnType<typeof getPost>> = null;
    $: postContent = $postData ? decodePostContent($postData.post.content) : null;

    let repliesTimelineId: TimelineId;
    $: repliesTimelineId = { group: 2, id: postId };

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

    $: date = (postData && new Date($postData.post.time.toNumber() * 1000)) ?? null;

    $: loading = postId && !postData;
</script>

<article>
    <div class="post">
        <AvatarOf address={$postData?.post.owner} />
        <div class="content-container">
            <div class="avatar-arrow">
                <KBoxEffect color="mode" radius="normal" background blur {loading} />
            </div>

            <KBoxEffect color="mode" radius="normal" background blur {loading} hideContent={loading}>
                <header>
                    <KBoxEffect color="gradient" background radius="tile">
                        <div class="header-inner">
                            <a href="#{$postData?.post.owner}" class="name">
                                <NicknameOf address={$postData?.post.owner} />
                                <KHoverMenu>
                                    <ProfileMiniCard address={$postData?.post.owner} />
                                </KHoverMenu>
                            </a>
                            <div class="date-time k-text-singleline">
                                <span class="date k-text-singleline">{date?.toLocaleString()}</span>
                            </div>
                        </div>
                    </KBoxEffect>
                </header>
                <div class="content k-text-multiline">
                    {#if $postData}
                        <Content content={postContent} />
                    {:else}
                        ...
                    {/if}
                </div>
            </KBoxEffect>
        </div>
    </div>
    <div class="actions">
        <KButton text>Reply to <NicknameOf address={$postData?.post.owner} /></KButton>
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

    .post {
        display: grid;
        --avatar-size: 2em;
        grid-template-columns: var(--avatar-size) 1fr;
        align-items: start;
        gap: calc(var(--k-padding) * 2.5);
    }

    .content-container {
        display: grid;
        gap: calc(var(--k-padding) * 0.5);
        padding: var(--k-padding);
    }

    .content {
        padding: 0 var(--k-padding);
    }

    .avatar-arrow {
        position: absolute;
        top: 0;
        left: 0;
        width: calc(var(--avatar-size) * 0.25);
        aspect-ratio: 2/4;
        transform: translate(calc(-100% + calc(var(--k-padding) * 0.25)), 50%);
        clip-path: polygon(0 50%, 100% 0, 100% 100%);
    }

    .header-inner {
        display: grid;
        grid-auto-flow: column;
        gap: var(--k-padding);
        align-items: center;
        justify-items: start;
        padding: 0 calc(var(--k-padding) * 0.5);
    }

    .replies {
        padding-left: calc(var(--k-padding) * 4);
    }

    .actions {
        display: grid;
        font-size: var(--k-font-x-smaller);
        justify-self: end;
    }

    .name {
        display: grid;
        grid-auto-flow: column;
        justify-content: start;
        align-items: center;
        gap: var(--k-padding);
        font-weight: bold;
    }

    .date-time {
        font-size: var(--k-font-xx-smaller);
        justify-self: end;
    }
</style>
