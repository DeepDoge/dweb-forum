<script context="module" lang="ts">
    import "$/lib/kicho-ui/root.css";
    import { account, isContractsReady, provider } from "$/plugins/wallet";
    import ClaimName from "$lib/App/ClaimName.svelte";
    import PublishPost from "$lib/App/PublishPost.svelte";
    import KModalHashRoute from "$lib/kicho-ui/components/KModalHashRoute.svelte";
    import { writable } from "svelte/store";
    import Header from "./_header.svelte";
    let pageHash = writable(location.hash || "#");
    window.addEventListener("hashchange", () => pageHash.set(location.hash || "#"));
</script>

<script lang="ts">
    import KLoading from "$lib/kicho-ui/components/KLoading.svelte";

    const pushState = history.pushState;
    history.pushState = function (...params) {
        if (params[2].toString() === location.href) return;
        pushState(...params);
    };

    let lastFoundPage: any = null;
    $: $pageHash && onHashChange();
    async function onHashChange() {
        switch ($pageHash) {
            case '"#/$/post"':
                return (lastFoundPage = (await import("$/pages/$/post.svelte")).default);
            default:
                if ($pageHash.length === 44 && $pageHash.startsWith("#/0x"))
                    return (lastFoundPage = (await import("$/pages/[address].svelte")).default);
                return (lastFoundPage = (await import("$/pages/index.svelte")).default);
        }
    }
</script>

<layout>
    {#if $account && $provider}
        {#await $provider.ready}
            Connecting...
        {:then}
            {#if $isContractsReady === true}
                {#key $provider.network.chainId}
                    <Header />
                    <main>
                        {#if lastFoundPage}
                            <svelte:component this={lastFoundPage} />
                        {/if}
                        <KModalHashRoute hash="#/$/publish" size="25em">
                            <PublishPost on:done={() => history.back()} />
                        </KModalHashRoute>
                        <KModalHashRoute hash="#/$/claim-name" size="15em">
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
        Connect Wallet
    {/if}
</layout>

<style>
    :global(:root) {
        --root-font-size-mul: 1.25;
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
        background-image: linear-gradient(to right bottom, var(--k-color-master) 20%, transparent);
        filter: blur(10rem) opacity(0.2);
    }

    footer {
        text-align: center;
    }
</style>
