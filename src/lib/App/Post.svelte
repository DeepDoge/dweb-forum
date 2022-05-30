<script lang="ts">
    import { getPost, getTimeline, TimelineId } from "$/plugins/api/timeline";
    import KBoxEffect from "$lib/kicho-ui/components/effects/KBoxEffect.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import KChip from "$lib/kicho-ui/components/KChip.svelte";
    import KHoverMenu from "$lib/kicho-ui/components/KHoverMenu.svelte";
    import NicknameOf from "./NicknameOf.svelte";
    import AvatarOf from "./AvatarOf.svelte";
    import ProfileMiniCard from "./ProfileMiniCard.svelte";

    export let postIndex: Parameters<typeof getPost>[0];
    export let showReplies = false;

    let post: Awaited<ReturnType<typeof getPost>> = null;
    let repliesTimelineId: TimelineId;
    $: repliesTimelineId = { group: 1, id: postIndex };
    let repliesTimeline: Awaited<ReturnType<typeof getTimeline>> = null;
    $: replies = repliesTimeline?.items;
    $: postIndex?.toString() !== $post?.index.toString() && updatePost();
    $: !showReplies && (repliesTimeline = null);
    async function updatePost() {
        post = null;
        repliesTimeline = null;
        post = await getPost(postIndex);
        if (showReplies) await updateReplies();
    }
    async function updateReplies() {
        repliesTimeline = await getTimeline(repliesTimelineId);
        if (!(await repliesTimeline.loadNewer())) return;
        for (let i = 0; i < 3; i++) if (!(await repliesTimeline.loadMore())) return;
    }

    $: date = (post && new Date($post.publishTime.toNumber() * 1000)) ?? null;

    $: loading = postIndex && !post;
</script>

<article>
    <div class="post">
        <AvatarOf address={$post?.owner} />
        <div class="content-container">
            <div class="avatar-arrow">
                <KBoxEffect color="mode" radius="normal" background blur {loading} hideContent={loading} />
            </div>

            <KBoxEffect color="mode" radius="normal" background blur {loading} hideContent={loading}>
                <header>
                    <KBoxEffect color="gradient" background radius="normal">
                        <div class="header-inner">
                            <div class="name">
                                <NicknameOf address={$post?.owner} />
                                <KHoverMenu>
                                    <ProfileMiniCard address={$post?.owner} />
                                </KHoverMenu>
                            </div>
                            <div class="date-time text-inline">
                                <span class="date text-inline">{date?.toLocaleString()}</span>
                            </div>
                        </div>
                    </KBoxEffect>
                </header>
                <div class="content text-multiline">
                    <p>{$post?.content}</p>
                </div>
            </KBoxEffect>
        </div>
    </div>
    <div class="actions">
        <KButton text size="x-smaller">
            <div>
                Reply to <NicknameOf address={$post?.owner} />
            </div>
        </KButton>
    </div>
    {#if showReplies && $replies?.length > 0}
        <div class="replies">
            {#each $replies as item (item.index.toString())}
                <svelte:self postIndex={item.index} />
            {/each}
        </div>
    {/if}
</article>

<style>
    article {
        display: grid;
        gap: calc(var(--k-padding));
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
        padding: 0 calc(var(--k-padding) * 0.5);
    }

    .replies {
        padding-left: calc(var(--k-padding) * 4);
    }

    .actions {
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
        padding: 0 calc(var(--k-padding) * 0.5);
    }
</style>
