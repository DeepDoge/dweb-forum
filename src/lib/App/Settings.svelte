<script lang="ts">
    import { chainOptions, changeChain, changeWalletChain, currentChainOption } from "$/tools/wallet";
    import ChainButton from "./ChainButton.svelte";
    import IpfsConfigs from "./IpfsConfigs.svelte";
</script>

<div class="settings">
    <h1>Settings</h1>
    <div class="item">
        <h2>Chain Options</h2>
        <h3>Current Chain:</h3>
        <div class="current-chain">
            <ChainButton chainId={currentChainOption.chainId} />
        </div>
        <h3>Pick Chain:</h3>
        <div class="chains">
            {#each chainOptions as chainOption (chainOption.chainId)}
                {#if chainOption.chainId !== currentChainOption.chainId}
                    <ChainButton
                        chainId={chainOption.chainId}
                        on:click={() => changeWalletChain(chainOption.chainId).then(() => changeChain(chainOption.chainId))}
                    />
                {/if}
            {/each}
        </div>
    </div>
    <div class="item">
        <h2>IPFS Config</h2>
        <IpfsConfigs />
    </div>
</div>

<style>
    h2 {
        font-size: 1.2em;
    }

    h3 {
        font-size: 1em;
    }

    .settings {
        display: grid;
        gap: calc(var(--k-padding) * 5);
    }

    .item {
        display: grid;
        gap: calc(var(--k-padding) * 1.5);
    }

    .chains,
    .current-chain {
        display: grid;
        gap: var(--k-padding);
    }
</style>
