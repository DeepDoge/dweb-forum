<script lang="ts">
    import KBoxEffect from "$lib/kicho-ui/components/effects/KBoxEffect.svelte";
    import KChip from "$lib/kicho-ui/components/KChip.svelte";
    import jazzicon from "@metamask/jazzicon";

    export let address: string;

    $: loading = !address;
    $: nftAvatar = false;

    let jazziconElement: HTMLDivElement;
    $: jazziconElement = address ? jazzicon(100, parseInt(address.substring("0x".length, 10), 16)) : null;
    $: jazziconDataURL = jazziconElement
        ? `data:image/svg+xml;base64,${window.btoa(new XMLSerializer().serializeToString(jazziconElement.querySelector("svg")))}`
        : null;
</script>

<div class="avatar-container">
    <div class="avatar">
        <KBoxEffect color="mode" radius="normal" background {loading} hideContent={loading}>
            <img alt="Avatar of {address}" style:--jazzicon="url({jazziconDataURL})" src={null} />
        </KBoxEffect>
    </div>
    {#if nftAvatar}
        <KChip size="xx-smaller" color="master">NFT</KChip>
    {/if}
</div>

<style>
    .avatar-container {
        display: grid;
        grid-template-columns: 100%;
        gap: var(--k-padding);
        align-content: start;
        justify-items: center;
    }

    .avatar {
        justify-self: stretch;
        aspect-ratio: 1/1;
        display: flex;
        place-items: stretch;
    }

    img {
        overflow: hidden;
        object-fit: cover;
        width: 100%;
        color: transparent;
    }

    img::before {
        content: "";
        position: absolute;
        inset: 0;
        background-image: var(--jazzicon);
        background-size: cover;
        background-position: center;
        background-color: #eb4140;
    }
</style>
