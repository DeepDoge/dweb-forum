<script context="module" lang="ts">
    window.addEventListener("hashchange", () => goto(location.href));
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

    const pushState = history.pushState;
    history.pushState = function (...params) {
        try {
            if (params[2].toString() === location.href) return;
            pushState(...params);
        } catch (error) {}
    };

    let currentPage: Page = null;
    const pageStates: Record<string, { props: object; scroll?: ScrollToOptions }> = {};
    const pages = [A4, Index, Profile, Topic] as const;
    type Page = ExtractGeneric<typeof pages>;

        function setCurrentPage<T extends Page>(component: T, props: T["prototype"]["$$prop_def"]) {
        const currentPageCache = currentPage;
        currentPage = component;
        const state = (pageStates[currentPage.name] = { ...pageStates[currentPage.name], props: props });

        if (currentPageCache && currentPage !== currentPageCache) {
            const scrollingElement = document.scrollingElement ?? document.body;
            pageStates[currentPageCache.name].scroll = {
                left: scrollingElement.scrollLeft,
                top: scrollingElement.scrollTop,
            };
        }

        if (state.scroll) setTimeout(() => window.scrollTo(state.scroll));
    }

    function setCurrentModal<T extends Page>(component: T, props: T["prototype"]["$$prop_def"]) {
        
    }

    $: $page && onHashChange();
    async function onHashChange() {
        const hash = decodeURIComponent($page.url.hash.substring(1));
        if (!hash) setCurrentPage(Index, {});
        else if (hash.startsWith("#")) {
            const route = hash.substring(1);
            const postPrefix = "post:";

            if (route === "claim-name") return; // modal route
            else if (route.startsWith(postPrefix)) return; // modal route //setCurrentPage(Post, { postIndex: BigNumber.from(route.substring(postPrefix.length)) });
            else setCurrentPage(A4, {});
        } else if (isValidAddress(hash)) setCurrentPage(Profile, { address: hash });
        else setCurrentPage(Topic, { topic: hash });
    }
</script>

<!-- Have to do it this way because svelte doesnt have keep-alive -->
{#each pages as page (page.name)}
    <div style:display={currentPage === page ? "block" : "none"}>
        {#if pageStates[page.name]}
            <svelte:component this={page} {...pageStates[page.name].props} />
        {/if}
    </div>
{/each}
