<script lang="ts">
    import KBoxEffect from "$lib/kicho-ui/components/effects/KBoxEffect.svelte";
    import KChip from "$lib/kicho-ui/components/KChip.svelte";

    export let address: string;

    $: loading = !address;
    $: nftAvatar = false;
</script>

<div class="avatar-container">
    <div class="avatar">
        <KBoxEffect color="mode" radius="normal" background {loading} hideContent={loading}>
            <img alt="Avatar of {address}" src={null} />
        </KBoxEffect>
    </div>
    {#if nftAvatar}
        <KChip size="xx-smaller" color="master">NFT</KChip>
    {/if}
</div>

<style>
    .avatar-container {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--k-padding);
        align-content: start;
        justify-items: center;
    }

    .avatar {
        justify-self: stretch;
        aspect-ratio: 1/1;
    }

    .avatar {
        display: grid;
    }

    img {
        overflow: hidden;
        object-fit: cover;
    }

    img::before {
        content: "";
        position: absolute;
        inset: 0;
        background-image: var(--k-color-gradient);
    }
</style>
