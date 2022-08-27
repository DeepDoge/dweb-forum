<script lang="ts">
    import { changeChain, changeWalletChain, wallet } from "$/tools/wallet";
    import { chainOptions } from "$/tools/wallet/chains";
    import KHoverMenu from "$lib/kicho-ui/components/KHoverMenu.svelte";
    import ChainButton from "./ChainButton.svelte";
</script>

<div class="pick-chain">
    <ChainButton chainId={wallet.service.currentChainOption.chainId} />
    <KHoverMenu size="normal">
        <div class="menu">
            {#each chainOptions as chainOption (chainOption.chainId)}
                {#if chainOption.chainId !== wallet.service.currentChainOption.chainId}
                    <ChainButton
                        chainId={chainOption.chainId}
                        on:click={() => changeWalletChain(chainOption.chainId).then(() => changeChain(chainOption.chainId))}
                    />
                {/if}
            {/each}
        </div>
    </KHoverMenu>
</div>

<style>
    .menu {
        width: 13em;
        display: grid;
        gap: var(--k-padding);
    }
</style>
