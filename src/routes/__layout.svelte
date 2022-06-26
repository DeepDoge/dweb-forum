<script context="module" lang="ts">
    export const globalDialogManager = createDialogManager();
</script>

<script lang="ts">
    import "$/lib/kicho-ui/root.css";
    import { isValidAddress } from "$/plugins/common/isValidAddress";
    import { changeNetwork,isContractsReady,provider } from "$/plugins/wallet";
    import ClaimName from "$lib/App/ClaimName.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import KDialog,{ createDialogManager } from "$lib/kicho-ui/components/KDialog.svelte";
    import KModalHashRoute from "$lib/kicho-ui/components/KModalHashRoute.svelte";
    import KTextField from "$lib/kicho-ui/components/KTextField.svelte";
    import Header from "./_header.svelte";
    import Routing,{ route } from "./_routing.svelte";
    
    let searchInput: string;
    async function search() {
        if (searchInput.startsWith("#")) location.hash = searchInput;
        if (isValidAddress(searchInput)) location.hash = `#${searchInput}`;
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
                        <form class="search-form" on:submit|preventDefault={search}>
                            <KTextField background bind:value={searchInput} placeholder="#Topic, 0xAddress, ENS name" size="larger" />
                            <KButton color="master" size="larger">Search</KButton>

                            {#if $route.route}
                                <div
                                    class="down-button"
                                    aria-hidden
                                    on:click={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
                                >
                                    ⌄
                                </div>
                            {/if}
                        </form>

                        <Routing />

                        <KModalHashRoute hash="claim-name" hashOverride={$route.hash}>
                            <ClaimName on:done={() => history.back()} />
                        </KModalHashRoute>

                        <KDialog dialogManager={globalDialogManager} />
                    </main>
                {/key}
            {:else if $isContractsReady === "wrongNetwork"}
                Wrong Network
                <span>
                    <KButton color="master" on:click={() => changeNetwork(137)}>Switch to Polygon(MATIC) Network</KButton>
                </span>
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
        --k-color-master: #8360c3;
        --k-color-slave: #2ebf91;
        --k-color-master-contrast: rgba(255, 255, 255, 0.9);
        --k-color-slave-contrast: rgba(255, 255, 255, 0.9);
        --k-color-gradient-contrast: rgba(255, 255, 255, 0.9);
        --k-border-width: 0.1em;
    }

    layout {
        display: grid;
        /* gap: calc(var(--k-padding) * 4); */
    }

    layout::before {
        content: "";
        position: fixed;
        inset: 0;
        background-size: cover;
        background-image: linear-gradient(to left bottom, var(--k-color-master), var(--k-color-slave));
        filter: opacity(0.01);
    }

    .search-form {
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        gap: 0.5em;
        height: 100vh;
        margin: auto;
        width: var(--k-page-width);
        padding: var(--k-page-padding);
        padding-top: 0;
    }

    .down-button {
        position: absolute;
        inset: 0;
        top: unset;
        display: grid;
        align-items: end;
        justify-content: center;
        padding: calc(var(--k-padding) * 3);
        cursor: pointer;
        font-size: var(--k-font-xx-larger);
        transition: var(--k-transition);
        transition-property: transform;
    }

    .down-button:hover {
        transform: translateY(-10%) scale(1.1);
    }
</style>
