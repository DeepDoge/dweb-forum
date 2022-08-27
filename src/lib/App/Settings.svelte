<script lang="ts">
    import { changeChain, changeWalletChain, wallet } from "$/tools/wallet";
    import { chainOptions } from "$/tools/wallet/chains";
    import ChainButton from "./ChainButton.svelte";
    import IpfsConfigs from "./IpfsConfigs.svelte";
</script>

<div class="settings">
    <h1>Settings</h1>
    <div class="item">
        <h2>Current chain</h2>
        <div class="current-chain">
            <ChainButton chainId={wallet.service.currentChainOption.chainId} />
        </div>
        <h2>Pick a chain</h2>
        <div class="chains">
            {#each chainOptions as chainOption (chainOption.chainId)}
                {#if chainOption.chainId !== wallet.service.currentChainOption.chainId}
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
    h1 {
        font-size: 1.5em;
    }

    h2 {
        font-size: 1em;
        text-align: center;
        font-weight: normal;
    }

    .settings {
        display: grid;
        gap: calc(var(--k-padding) * 7.5);
    }

    .item {
        display: grid;
        gap: calc(var(--k-padding) * 3);
    }

    .current-chain {
        display: grid;
    }

    .chains {
        display: grid;
        gap: var(--k-padding);
        grid-template-columns: repeat(2, 1fr);
    }
</style>
