<script lang="ts">
    import { ipfsClient } from "$/tools/ipfs/client";
    import { changeNetwork, currentProviderInfo, isContractsReady, provider } from "$/tools/wallet";
    import ClaimName from "$lib/App/ClaimName.svelte";
    import KApp from "$lib/kicho-ui/components/KApp.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import KDialog from "$lib/kicho-ui/components/KDialog.svelte";
    import KModalHashRoute from "$lib/kicho-ui/components/KModalHashRoute.svelte";
    import KTextField from "$lib/kicho-ui/components/KTextField.svelte";
    import { globalDialogManager } from "$lib/kicho-ui/components/KDialog.svelte";
    import { ethers } from "ethers";
    import Header from "./_header.svelte";
    import Routing, { currentRoute } from "./_routing.svelte";
    import KTaskNotification, { globalTaskNotificationManager } from "$lib/kicho-ui/components/KTaskNotification.svelte";

    let searchInput: string;
    async function search() {
        if (searchInput.startsWith("#")) location.hash = searchInput.toLowerCase();
        if (ethers.utils.isAddress(searchInput)) location.hash = `#${searchInput}`;
    }
</script>

<KApp>
    <layout>
        {#if $provider}
            {#await $provider.ready}
                Connecting...
            {:then}
                {#if $isContractsReady === true}
                    {#key $provider.network.chainId}
                        {#if $ipfsClient}
                            <Header />
                            <main>
                                <form class="search-form" on:submit|preventDefault={search}>
                                    <KTextField background bind:value={searchInput} placeholder="#Topic, 0xAddress, ENS name" />
                                    <KButton color="master">Search</KButton>
                                </form>

                                <Routing />

                                <KModalHashRoute hash="claim-name" hashOverride={$currentRoute.hash}>
                                    <ClaimName on:done={() => history.back()} />
                                </KModalHashRoute>

                                <KTaskNotification taskNotificationManager={globalTaskNotificationManager} />
                                <KDialog dialogManager={globalDialogManager} />
                            </main>
                        {:else}
                            Waiting for IPFS Client...
                        {/if}
                    {/key}
                {:else if $isContractsReady === "wrongNetwork"}
                    Wrong Network
                    <span>
                        <KButton color="master" on:click={() => changeNetwork($currentProviderInfo)}
                            >Switch to {$currentProviderInfo.chainName} Network</KButton
                        >
                    </span>
                {:else}
                    Getting Contracts
                {/if}
            {/await}
        {:else}
            Waiting Provider...
        {/if}
    </layout>
</KApp>

<style>
    :global(:root) {
        --root-font-size-mul: 1;
        --k-color-master: #8360c3;
        --k-color-slave: #208b69;
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

    main {
        display: grid;
        gap: calc(var(--k-padding) * 5);
    }
    .search-form {
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: stretch;
        gap: 0.5em;
        margin: auto;
        width: var(--k-page-width);
        padding: var(--k-page-padding);
    }
</style>
