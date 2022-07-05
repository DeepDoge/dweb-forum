<script context="module" lang="ts">
    window.addEventListener("hashchange", () => goto(location.href));
    const scrollCache = writable({ top: 0, left: 0 });
    const scrollingElement = document.scrollingElement ?? document.body;
    window.addEventListener("scroll", () => scrollCache.set({ top: scrollingElement.scrollTop, left: scrollingElement.scrollLeft }));
    
    const pushState = history.pushState;
    history.pushState = function (...params) {
        if (params[2].toString() === location.href) return;
        pushState.call(history, ...params)
    };

    const pages = [A4, Index, Profile, Topic] as const;
    type Page = ExtractGeneric<typeof pages>;

    interface Route<P extends Page = Page> {
        page: P;
        path: string;
        pathArr: string[];
        hash: string;
        props: P["prototype"]["$$prop_def"];
    }

    export const currentRoute = writable<Route>({
        hash: null,
        pathArr: [],
        props: {},
        page: null,
        path: null,
    });
</script>

<script lang="ts">
    import A4 from "$/pages/404.svelte";
    import Index from "$/pages/index.svelte";
    import Profile, { profilePageTabsKeys } from "$/pages/profile.svelte";
    import Topic from "$/pages/topic.svelte";
    import { isValidAddress } from "$/plugins/utils/isValidAddress";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import type { ExtractGeneric } from "$lib/kicho-ui/types/util";
    import { writable } from "svelte/store";

    const pageStates: Record<string, { props: Record<string, any> }> = {};
    const routeScrolls: Record<string, ScrollToOptions> = {};

    function setCurrentPage<R extends Route>(route: R) {
        const routeCache = $currentRoute;
        $currentRoute = route;
        const key = route.path;
        const keyCache = routeCache.path;
        const state = (pageStates[route.page.name] = { ...pageStates[route.page.name], props: route.props });
        const scroll = routeScrolls[key];

        console.log('route', route)

        // Scroll
        if (key !== keyCache) {
            if (routeCache) {
                routeScrolls[keyCache] = {
                    left: scrollingElement.scrollLeft,
                    top: scrollingElement.scrollTop,
                };
            }

            setTimeout(() => {
                if (scroll) window.scrollTo(scroll);
            });
        }
    }

    $: $page && onHashChange();
    async function onHashChange() {
        const hashValue = decodeURIComponent($page.url.hash.substring(1));
        const separatorIndex = hashValue.indexOf("#");

        const path = hashValue.substring(0, separatorIndex >= 0 ? separatorIndex : undefined);
        const hash = separatorIndex >= 0 ? hashValue.substring(separatorIndex + 1) : "";
        const pathArr = path.split("/");

        if (!path) {
            setCurrentPage({ page: Index, path, pathArr, hash, props: {} });
        } else if (isValidAddress(pathArr[0]) && profilePageTabsKeys.includes((pathArr[1] ?? "") as any)) {
            setCurrentPage({ page: Profile, path, pathArr, hash, props: { address: pathArr[0], modeKey: pathArr[1] ?? ("" as any) } });
        } else {
            setCurrentPage({ page: Topic, path, pathArr, hash, props: { topic: path } });
        }
        // else setCurrentPage(A4, {});
    }

    $: id = $page.url.hash.substring(1);
</script>

<div class="hash-scroll-fix" {id} style:--top={$scrollCache.top} style:--left={$scrollCache.left} />

<!-- Have to do it this way because svelte doesnt have keep-alive -->
{#each pages as page (page.name)}
    <div class="page" style:display={$currentRoute.page.name === page.name ? "block" : "none"}>
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
