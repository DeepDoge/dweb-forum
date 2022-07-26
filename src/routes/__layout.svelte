<script lang="ts">
    import { ipfsClient } from "$/tools/ipfs/client";
    import { connectWallet, currentProviderInfo, updateWalletNetwork, wallet } from "$/tools/wallet";
    import KApp from "$lib/kicho-ui/components/KApp.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";

    $: walletState = wallet.state;

    window.dispatchEvent(new Event("_app-ready"));
</script>

<KApp>
    <layout>
        {#if $walletState === "ready"}
            {#if $ipfsClient}
                {#await import("./_layout.svelte")}
                    Loading App Layout...
                {:then Layout}
                    <svelte:component this={Layout.default} />
                {:catch err}
                    Failed to Load App Layout. Reloading...
                    {(() => {
                        setTimeout(() => location.reload(), 3000) 
                        console.error(err)
                        return ''
                    })()}
                {/await}
            {:else}
                Waiting for IPFS Client...
            {/if}
        {:else if $walletState === "wrongNetwork"}
            Wrong Wallet Network
            <span>
                <KButton color="master" on:click={() => updateWalletNetwork()}>
                    Switch to {currentProviderInfo.chainName} Network
                </KButton>
            </span>
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
</style>
