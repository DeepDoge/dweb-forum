<script lang="ts">
    import { chainOptionsByChainId, changeChain } from "$/tools/wallet";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";

    export let chainId: string;
    $: chainOption = chainOptionsByChainId[chainId];
</script>

<div class="outer" style:--k-color-master={chainOption.themeColor}>
    <KButton background radius="normal" color="master" on:click>
        <div class="inner" style:--icon="url({chainOption.iconSrc})">
            {chainOption.chainName}
        </div>
    </KButton>
</div>

<style>
    .outer {
        display: contents;
    }

    .inner {
        display: grid;
        grid-template-columns: 2ch 1fr;
        gap: calc(var(--k-padding) * 2);
    }

    .inner::before {
        content: "";
        width: 100%;
        aspect-ratio: 1 / 1;
        background-image: var(--icon);
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
    }
</style>
