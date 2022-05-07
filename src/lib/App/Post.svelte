<script context="module" lang="ts">
    export type PostType = Awaited<ReturnType<typeof appContract["posts"]>>;
    type TopTagType = Awaited<ReturnType<typeof appContract["topTagsOfPost"]>>;
</script>

<script lang="ts">
    import { appContract } from "$/plugins/wallet";
    import KBoxEffect from "$lib/kicho-ui/components/effects/KBoxEffect.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import KChip from "$lib/kicho-ui/components/KChip.svelte";
    import ProfileInline from "./ProfileInline.svelte";

    export let post: PostType;

    const TOP_TAG_COUNT = 4; // await appContract.TOP_TAG_COUNT() returns Promise for some unneeded reason
    let topTags: TopTagType[] = null;
    $: post && updateTopTags();
    async function updateTopTags() {
        topTags = [];
        for (let i = 0; i < TOP_TAG_COUNT; i++) topTags.push(await appContract.topTagsOfPost(post.id, i));
    }

    $: date = (post && new Date(post.publishTime.toNumber() * 1000)) ?? null;
</script>

<article>
    <KBoxEffect background border glow radius="rounded">
        <div class="post">
            <header>
                <ProfileInline address={post.owner} />
                <div class="date-time">
                    <span class="date text-inline">{date.toDateString()}</span>
                    <span class="time text-inline">{date.toLocaleTimeString()}</span>
                </div>
            </header>
            <hr />
            <div class="content text-multiline">
                <p>{post.content}</p>
            </div>
            <div class="tags">
                <span>Tags:</span>
                {#each topTags as tag}
                    <KChip size="smaller">{tag.tag}</KChip>
                {/each}
                <KButton text>+ Add</KButton>
            </div>
        </div>
    </KBoxEffect>
</article>

<style>
    .post {
        display: grid;
        padding: calc(var(--k-padding) * 4);
    }

    header {
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: start;
        gap: var(--k-padding);
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
