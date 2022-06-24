<script lang="ts">
    import type { getTimeline } from "$/plugins/api/timeline";
    import KIntersectionObserver from "$lib/kicho-ui/components/KIntersectionObserver.svelte";
    export let timeline: Awaited<ReturnType<typeof getTimeline>>;
    $: postIds = timeline?.postIds;

    let bottomIntersecting: boolean;
    let bottomEnd = false;
    let bottomLoop = false;
    $: !bottomEnd && !bottomLoop && bottomIntersecting && onChange(bottomIntersecting);

    $: loading = timeline.loading;

    let lastLoadMoreResult: Awaited<ReturnType<typeof timeline["loadMore"]>>;
    async function onChange(value: typeof bottomIntersecting) {
        bottomLoop = true;
        while (bottomIntersecting) {
            lastLoadMoreResult = await timeline.loadMore();
            if (lastLoadMoreResult === false) {
                bottomEnd = true;
                break;
            }
            await new Promise((r) => setTimeout(r, 0));
        }
        bottomLoop = false;
    }
</script>

{#if timeline}
    <div class="posts">
        {#each $postIds as postId (postId.toString())}
            <slot {postId} />
        {/each}
    </div>
    {#if !bottomEnd}
        <KIntersectionObserver bind:intersecting={bottomIntersecting} rootMargin="{window.innerHeight * 5}px 0px">
            <div />
        </KIntersectionObserver>
    {:else}
        <div class="end">•</div>
    {/if}
{/if}

<style>
    .posts {
        display: grid;
        gap: calc(var(--k-padding) * 2);
    }

    .end {
        display: grid;
        place-content: center;
        width: auto;
        margin: auto;
        padding: calc(var(--k-padding) * 1);
    }
</style>
