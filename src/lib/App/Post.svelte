<script lang="ts">
    import { getPost } from "$/plugins/api";
    import KBoxEffect from "$lib/kicho-ui/components/effects/KBoxEffect.svelte";
    import ProfileInline from "./ProfileInline.svelte";

    export let postIndex: Parameters<typeof getPost>[0];
    let post: Awaited<ReturnType<typeof getPost>> = null;
    $: postIndex && updatePost();
    async function updatePost() {
        post = await getPost(postIndex);
    }

    $: date = (post && new Date($post.publishTime.toNumber() * 1000)) ?? null;
</script>

{#if post}
    <article>
        <KBoxEffect background border glow radius="rounded">
            <div class="post">
                <header>
                    <ProfileInline address={$post.owner} />
                    <div class="date-time">
                        <span class="date text-inline">{date.toDateString()}</span>
                        <span class="time text-inline">{date.toLocaleTimeString()}</span>
                    </div>
                </header>
                <hr />
                <div class="content text-multiline">
                    <p>{$post.content}</p>
                </div>
                <div class="tags" />
            </div>
        </KBoxEffect>
    </article>
{/if}

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
