<script context="module" lang="ts">
    import A4 from "$/pages/404.svelte";
    import Index from "$/pages/index.svelte";
    import Profile, { profilePageTabsKeys } from "$/pages/profile.svelte";
    import Topic from "$/pages/topic.svelte";
    import { page } from "$app/stores";
    import type { ExtractGeneric } from "$lib/kicho-ui/types/util";
    import { ethers } from "ethers";
    import { writable } from "svelte/store";
    import { currentRoute } from "./_routing";

    const pages = [A4, Index, Profile, Topic] as const;
    type Page = ExtractGeneric<typeof pages>;

    interface PageInfo<P extends Page = Page> {
        page: P;
        props: P["prototype"]["$$prop_def"];
    }

    const currentPageInfo = writable<PageInfo>(null);
    const routeScrolls: Record<string, ScrollToOptions> = {};

    const scrollCache = writable({ top: 0, left: 0 });
    const scrollingElement = document.scrollingElement ?? document.body;
    window.addEventListener("scroll", () => scrollCache.set({ top: scrollingElement.scrollTop, left: scrollingElement.scrollLeft }));

    function setCurrentPageInfo<P extends PageInfo>(pageInfo: P) {
        currentPageInfo.set(pageInfo);
    }

    currentRoute.subscribe((route) => {
        if (!route.path) {
            setCurrentPageInfo({
                page: Index,
                props: {},
            });
        } else if (ethers.utils.isAddress(route.pathArr[0]) && profilePageTabsKeys.includes((route.pathArr[1] ?? "") as any)) {
            setCurrentPageInfo({
                page: Profile,
                props: { address: route.pathArr[0], modeKey: route.pathArr[1] ?? ("" as any) },
            });
        } else {
            setCurrentPageInfo({
                page: Topic,
                props: { topic: route.path },
            });
        }
        // else setCurrentPage(A4, {});
    });
</script>

<script lang="ts">
    let keyCache: string = null;

    const pageStates: Record<string, { props: Record<string, any> }> = {};

    $: $currentPageInfo, onPageInfoChange();
    function onPageInfoChange() {
        const key = $currentRoute.path;
        const state = (pageStates[$currentPageInfo.page.name] = { ...pageStates[$currentPageInfo.page.name], props: $currentPageInfo.props });
        const scroll = routeScrolls[key];

        // Scroll
        if (key !== keyCache) {
            if (keyCache) {
                routeScrolls[keyCache] = {
                    left: scrollingElement.scrollLeft,
                    top: scrollingElement.scrollTop,
                };
            }

            setTimeout(() => {
                if (scroll) window.scrollTo(scroll);
            });
        }

        keyCache = key;
    }

    $: id = $page.url.hash.substring(1);
</script>

<div class="hash-scroll-fix" {id} style:--top={$scrollCache.top} style:--left={$scrollCache.left} />

<!-- Have to do it this way because svelte doesnt have keep-alive -->
{#each pages as page (page.name)}
    <div class="page" style:display={$currentPageInfo.page.name === page.name ? "block" : "none"}>
        {#if pageStates[page.name]}
            <svelte:component this={page} {...pageStates[page.name].props} active={$currentPageInfo.page.name === page.name} />
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
