<script lang="ts">
    import "$/lib/kicho-ui/root.css";
    import { isValidAddress } from "$/plugins/common/isValidAddress";
    import { changeNetwork, isContractsReady, provider } from "$/plugins/wallet";
    import { page } from "$app/stores";
    import ClaimName from "$lib/App/ClaimName.svelte";
    import Post from "$lib/App/Post.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import KModalHashRoute from "$lib/kicho-ui/components/KModalHashRoute.svelte";
    import KPageContainer from "$lib/kicho-ui/components/KPageContainer.svelte";
    import KTextField from "$lib/kicho-ui/components/KTextField.svelte";
    import { BigNumber } from "ethers";
    import Header from "./_header.svelte";
    import Routing from "./_routing.svelte";

    let searchInput: string;
    async function search() {
        if (/^\d+$/.test(searchInput)) location.hash = `##post:${BigNumber.from(searchInput)}`;
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
                        <KPageContainer>
                            <form class="search-form" on:submit|preventDefault={search}>
                                <KTextField
                                    color="mode"
                                    background
                                    bind:value={searchInput}
                                    placeholder="#Topic, 0xAddress, ENS name, PostIndex"
                                    size="larger"
                                />
                                <KButton color="master" size="larger">Search</KButton>
                            </form>
                        </KPageContainer>

                        <Routing />

                        <KModalHashRoute hash="##claim-name">
                            <ClaimName on:done={() => history.back()} />
                        </KModalHashRoute>
                    </main>
                    <!-- <footer>Web3 Forum</footer> -->
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
        gap: calc(var(--k-padding) * 4);
    }

    /*     layout::before {
        content: "";
        position: fixed;
        inset: 0;
        background-size: cover;
        background-image: linear-gradient(to left bottom, var(--k-color-master), var(--k-color-slave));
        filter: opacity(0.25);
    } */

    .search-form {
        display: grid;
        grid-template-columns: 1fr auto;
        grid-template-rows: 2.5em;
        align-items: stretch;
        align-content: stretch;
        gap: 0.5em;
        padding-bottom: 10vh;
    }

    /* footer {
        text-align: center;
    } */
</style>
