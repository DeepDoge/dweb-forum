<script context="module" lang="ts">
    window.addEventListener("hashchange", () => goto(location.href));
    const scrollCache = writable({ top: 0, left: 0 });
    const scrollingElement = document.scrollingElement ?? document.body;
    window.addEventListener("scroll", () => scrollCache.set({ top: scrollingElement.scrollTop, left: scrollingElement.scrollLeft }));

    export const currentTopicPost = writable<{ topic: string; postId?: BigNumber }>(null);
</script>

<script lang="ts">
    import A4 from "$/pages/404.svelte";
    import Index from "$/pages/index.svelte";
    import Profile from "$/pages/profile.svelte";
    import Topic from "$/pages/topic.svelte";
    import { isValidAddress } from "$/plugins/common/isValidAddress";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import type { ExtractGeneric } from "$lib/kicho-ui/types/util";
    import { BigNumber } from "ethers";
    import { writable } from "svelte/store";
    
    const pushState = history.pushState;
    history.pushState = function (...params) {
        try {
            if (params[2].toString() === location.href) return;
            pushState(...params);
        } catch (error) {}
    };

    let currentPage: Page = null;
    const pageStates: Record<string, { props: Record<string, any>; scroll?: ScrollToOptions }> = {};
    const pages = [A4, Index, Profile, Topic] as const;
    type Page = ExtractGeneric<typeof pages>;

    function setCurrentPage<T extends Page>(component: T, props: T["prototype"]["$$prop_def"]) {
        const currentPageCache = currentPage;
        currentPage = component;
        const state = (pageStates[currentPage.name] = { ...pageStates[currentPage.name], props: props });

        if (currentPageCache) {
            pageStates[currentPageCache.name].scroll = {
                left: scrollingElement.scrollLeft,
                top: scrollingElement.scrollTop,
            };
        }

        if (state.scroll) setTimeout(() => window.scrollTo(state.scroll));
    }

    function parseTopicPostHash(hash: string) {
        const parts = hash.split(":");
        if (parts.length !== 2) return false;
        return {
            topic: parts[0],
            postId: BigNumber.from(parts[1]),
        };
    }

    $: $page && onHashChange();
    async function onHashChange() {
        const hash = decodeURIComponent($page.url.hash.substring(1));
        if (!hash) setCurrentPage(Index, {});
        else if (hash.startsWith("#")) {
            const route = hash.substring(1);
            const topicPost = parseTopicPostHash(route);
            if (topicPost) $currentTopicPost = topicPost;

            if (route === "claim-name") return; // modal route
            else if (topicPost) setCurrentPage(Topic, topicPost);
            else setCurrentPage(A4, {});
        } else if (isValidAddress(hash)) setCurrentPage(Profile, { address: hash });
        else 
        {
            $currentTopicPost = { topic: hash }
            setCurrentPage(Topic, { topic: hash });
        }
    }

    $: id = $page.url.hash.substring(1);
</script>

<div class="hash-scroll-fix" {id} style:--top={$scrollCache.top} style:--left={$scrollCache.left} />

<!-- Have to do it this way because svelte doesnt have keep-alive -->
{#each pages as page (page.name)}
    <div style:display={currentPage === page ? "block" : "none"}>
        {#if pageStates[page.name]}
            <svelte:component this={page} {...pageStates[page.name].props} />
        {/if}
    </div>
{/each}

<style>
    .hash-scroll-fix {
        position: fixed;
        top: calc(var(--top) * 1px);
        left: calc(var(--left) * 1px);
        width: 1px;
        height: 1px;
    }
</style>
