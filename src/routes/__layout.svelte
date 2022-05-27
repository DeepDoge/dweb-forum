<script context="module" lang="ts">
    import "$/lib/kicho-ui/root.css";
import A4 from "$/pages/404.svelte";
import Index from "$/pages/index.svelte";
import Post from "$/pages/post.svelte";
import Profile from "$/pages/profile.svelte";
import Topic from "$/pages/topic.svelte";
    import { isValidAddress } from "$/plugins/common/isValidAddress";
    import { isContractsReady, provider } from "$/plugins/wallet";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import ClaimName from "$lib/App/ClaimName.svelte";
    import KModalHashRoute from "$lib/kicho-ui/components/KModalHashRoute.svelte";
    import { BigNumber } from "ethers";
    import Header from "./_header.svelte";

    window.addEventListener("hashchange", () => goto(location.href));
</script>

<script lang="ts">
    const pushState = history.pushState;
    history.pushState = function (...params) {
        if (params[2].toString() === location.href) return;
        pushState(...params);
    };

    let lastFoundPage: any = null;
    $: $page && onHashChange();
    let pageProps: object = {};
    async function onHashChange() {
        const route = $page.url.hash.substring(1);
        if (!route) return (lastFoundPage = Index);
        if (route.startsWith("#")) {
            switch (route.substring(1)) {
                default:
                    const postPrefix = "#post:";
                    if (route.startsWith(postPrefix)) {
                        pageProps = { postIndex: BigNumber.from(route.substring(postPrefix.length)) };
                        return (lastFoundPage = Post);
                    }
                    return (lastFoundPage = A4);
            }
        }

        if (isValidAddress(route)) {
            pageProps = { address: route };
            return (lastFoundPage = Profile);
        }

        {
            pageProps = { topic: route };
            return (lastFoundPage = Topic);
        }
    }
</script>

<layout>
    {#if $provider}
        {#await $provider.ready}
            Connecting...
        {:then}
            {#if $isContractsReady === true}
                {#key $provider.network.chainId}
                    <Header />
                    <main>
                        {#if lastFoundPage}
                            <svelte:component this={lastFoundPage} {...pageProps} />
                        {/if}
                        <KModalHashRoute hash="##claim-name">
                            <ClaimName on:done={() => history.back()} />
                        </KModalHashRoute>
                    </main>
                    <footer>...</footer>
                {/key}
            {:else if $isContractsReady === "wrongNetwork"}
                Wrong Network
            {:else}
                Getting Contracts
            {/if}
        {/await}
    {:else}
        Waiting Provider...
    {/if}
</layout>

<style>
    :global(:root) {
        --root-font-size-mul: 1;
        --k-color-master: #7e683c;
        --k-color-slave: #725a4b;
        --k-color-master-contrast: rgba(255, 255, 255, 0.9);
        --k-color-slave-contrast: rgba(255, 255, 255, 0.9);
        --k-color-gradient-contrast: rgba(255, 255, 255, 0.9);
        --k-border-width: 0.1em;
    }

    layout {
        display: grid;
        gap: calc(var(--k-padding) * 4);
    }

    layout::before {
        content: "";
        position: fixed;
        inset: 0;
        background-size: cover;
        background-image: var(--k-color-gradient);
        filter: opacity(0.25);
    }

    footer {
        text-align: center;
    }
</style>
