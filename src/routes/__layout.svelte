<script lang="ts">
    import { ipfsClient } from "$/tools/ipfs/client";
    import { chainOptionsByChainId, connectWallet, currentChainOption, wallet } from "$/tools/wallet";
    import ChangeChain from "$lib/App/ChangeChain.svelte";
    import KApp from "$lib/kicho-ui/components/KApp.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import { ethers } from "ethers";

    $: walletState = wallet.state;

    window.dispatchEvent(new Event("_app-ready"));
</script>

<KApp>
    <layout class:not-ready={$walletState !== "ready"}>
        {#if $walletState === "ready"}
            {#if $ipfsClient}
                {#await import("./_layout.svelte")}
                    Loading App Layout...
                {:then Layout}
                    <svelte:component this={Layout.default} />
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
                <ChangeChain chainId={currentChainOption.chainId} />
            </div>
            {#if wallet.account && chainOptionsByChainId[ethers.utils.hexValue(wallet.web3Provider.network.chainId)]}
                <div class="change-chain">
                    <span>Or use</span>
                    <ChangeChain chainId={ethers.utils.hexValue(wallet.web3Provider.network.chainId)} />
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

    layout.not-ready {
        display: grid;
        gap: var(--k-padding);
    }

    .change-chain {
        display: grid;
        grid-auto-flow: column;
        gap: 1ch;
        align-items: center;
        justify-content: start;
    }
</style>
