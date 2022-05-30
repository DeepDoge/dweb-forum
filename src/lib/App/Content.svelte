<script lang="ts">
    import { isValidAddress } from "$/plugins/common/isValidAddress";
    import { isValidIpfsHash } from "$/plugins/common/isValidIpfsHash";
    import { getIpfsUrl } from "$/plugins/ipfs/url";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import KHoverMenu from "$lib/kicho-ui/components/KHoverMenu.svelte";
    import ProfileMiniCard from "./ProfileMiniCard.svelte";

    export let content: string;
    $: array = content?.split(/(\s+)/) ?? [];
</script>

{#each array as part, i (i)}
    {#if isValidAddress(part)}
        <KButton text>
            {part}
            <KHoverMenu>
                <ProfileMiniCard address={part} />
            </KHoverMenu>
        </KButton>
    {:else if isValidIpfsHash(part)}
        <a class="text-inline" href={getIpfsUrl(part)}>{part}</a>
    {:else if part.startsWith("image,") && isValidIpfsHash(part.substring("image,".length))}
        <a class="image-link text-inline" href={getIpfsUrl(part.substring("image,".length))}>{part.substring("image,".length)}</a>
        <div class="image">
            <img alt="IPFS" src={getIpfsUrl(part.substring("image,".length))} />
        </div>
    {:else if part === "\n"}
        <br />
    {:else}
        {part}
    {/if}
{/each}

<style>
    .image {
        width: min(100%, 20em);
        aspect-ratio: 4/3;
        margin: var(--k-padding) 0;
    }
    .image-link {
        display: block;
    }

    img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
        object-position: center;
        background-color: black;
    }

    a {
        color: var(--k-color-master);
    }
</style>
