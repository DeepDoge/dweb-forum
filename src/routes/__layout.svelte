<script context="module" lang="ts">
    const version = '0.0.3'
    if (localStorage.getItem('current-version') !== version)
    {
        console.log('a')
        indexedDB.databases().then((databases) => {
            databases.forEach((database) => indexedDB.deleteDatabase(database.name))
        })
        localStorage.clear()
        localStorage.setItem('current-version', version)
        location.reload()
    }
</script>

<script lang="ts">
    import { defaultIpfsConfigs, ipfsClient, ipfsConfigs, noIpfsClientFound } from "$/tools/ipfs/client";
    import { chainOptionsByChainId, changeChain, connectWallet, currentChainOption, changeWalletChain, wallet } from "$/tools/wallet";
    import ChainButton from "$lib/App/ChainButton.svelte";
    import IpfsConfigs from "$lib/App/IpfsConfigs.svelte";
    import KApp from "$lib/kicho-ui/components/KApp.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import KSpinner from "$lib/kicho-ui/components/KSpinner.svelte";
    import { ethers } from "ethers";

    $: walletState = wallet.state;

    let layoutPromise = import("./_layout.svelte");
    let layoutReady = false;
    $: console.log(layoutPromise)
    $: layoutPromise ? layoutPromise.then(() => layoutReady = true) : (layoutReady = false);

    $: loading = !layoutReady || !$ipfsClient || $walletState !== 'ready'

    window.dispatchEvent(new Event("_app-ready"));
</script>

<KApp>
    <div id="app" class:loading>
        {#if loading}
            <KSpinner />
        {/if}
        {#if $walletState === "ready"}
            {#if $noIpfsClientFound}
                No IPFS Client is accessable.
                {#if JSON.stringify(defaultIpfsConfigs) !== JSON.stringify($ipfsConfigs)}
                    <div>It seems that you are not using the default IPFS settings.</div>
                    <div>You might try resetting the settings.</div>
                {/if}
                <div>
                    Change IPFS settings:
                    <IpfsConfigs />
                </div>
            {:else if $ipfsClient}
                {#await layoutPromise}
                    Loading App Layout...
                {:then Layout}
                    <layout>
                        <svelte:component this={Layout.default} />
                    </layout>
                {:catch err}
                    Failed to Load App Layout. Reloading...
                    {(() => {
                        setTimeout(() => location.reload(), 3000);
                        console.error(err);
                        return "";
                    })()}
                {/await}
            {:else}
                Waiting for IPFS Client...
            {/if}
        {:else if $walletState === "wrongNetwork"}
            Wrong Wallet Network
            <div class="change-chain">
                <span>Switch to</span>
                <ChainButton chainId={currentChainOption.chainId} on:click={() => changeWalletChain(currentChainOption.chainId)} />
            </div>
            {#if wallet.account && chainOptionsByChainId[ethers.utils.hexValue(wallet.web3Provider.network.chainId)]}
                <div class="change-chain">
                    <span>Or use</span>
                    <ChainButton
                        chainId={ethers.utils.hexValue(wallet.web3Provider.network.chainId)}
                        on:click={() => changeChain(ethers.utils.hexValue(wallet.web3Provider.network.chainId))}
                    />
                </div>
            {/if}
        {:else if $walletState === "notConnected"}
            No Wallet Connected
            <span>
                <KButton color="master" on:click={() => connectWallet()}>Connect Wallet</KButton>
            </span>
        {:else if $walletState === "connecting"}
            Connecting Wallet...
        {:else if $walletState === "loading"}
            Getting Contracts...
        {/if}
    </div>
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

    #app {
        min-height: 100vh;
    }

    #app.loading {
        display: grid;
        gap: calc(var(--k-padding) * 4);
        place-content: center;
    }

    #app::before {
        content: "";
        position: fixed;
        inset: 0;
        background-size: cover;
        background-image: linear-gradient(to left bottom, var(--k-color-master), var(--k-color-slave));
        filter: opacity(0.01);
    }

    .change-chain {
        display: grid;
        grid-auto-flow: column;
        gap: 1ch;
        align-items: center;
        justify-content: start;
    }
</style>
