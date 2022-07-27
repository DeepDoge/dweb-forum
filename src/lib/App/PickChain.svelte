<script lang="ts">
    import { chainOptions, currentChainOption } from "$/tools/wallet";
    import KHoverMenu from "$lib/kicho-ui/components/KHoverMenu.svelte";
    import ChangeChain from "./ChangeChain.svelte";
</script>

<div class="pick-chain">
    <ChangeChain disabled chainId={currentChainOption.chainId} />
    <KHoverMenu size="normal">
        <div class="menu">
            {#each chainOptions as chainOption (chainOption.chainId)}
                {#if chainOption.chainId !== currentChainOption.chainId}
                    <ChangeChain chainId={chainOption.chainId} />
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
