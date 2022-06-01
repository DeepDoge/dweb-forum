<script lang="ts">
    import { isValidAddress } from "$/plugins/common/isValidAddress";
    import { isValidIpfsHash } from "$/plugins/common/isValidIpfsHash";
    import { getIpfsUrl } from "$/plugins/ipfs/url";
    import KHoverMenu from "$lib/kicho-ui/components/KHoverMenu.svelte";
    import AvatarOf from "./AvatarOf.svelte";
    import NicknameOf from "./NicknameOf.svelte";
    import ProfileMiniCard from "./ProfileMiniCard.svelte";

    export let content: string;
    $: array = content?.split(/(\s+)/) ?? [];
</script>

{#each array as part, i (i)}
    {#if isValidAddress(part)}
        <a class="profile-inline" href="#{part}">
            <AvatarOf address={part} />
            <NicknameOf address={part} />
            <KHoverMenu>
                <ProfileMiniCard address={part} />
            </KHoverMenu>
        </a>
    {:else if isValidIpfsHash(part)}
        <a target="_blank" href={getIpfsUrl(part)}>{part}</a>
    {:else if part.startsWith("image,") && isValidIpfsHash(part.substring("image,".length))}
        <a class="image" target="_blank" href={getIpfsUrl(part.substring("image,".length))}>
            <img alt="IPFS" src={getIpfsUrl(part.substring("image,".length))} />
        </a>
    {:else if part === "\n"}
        <br />
    {:else}
        {part}
    {/if}
{/each}

<style>
    img {
        min-width: 10rem;
        min-height: 10rem;
        max-height: 15rem;
        height: 100%;
        object-fit: contain;
        object-position: left;

        background-color: var(--k-color-mode-pop);
    }

    .image {
        width: 100%;
        display: grid;
        justify-content: start;
        grid-template-columns: auto;
        grid-template-rows: auto;
        padding: var(--k-padding);
    }

    .profile-inline {
        display: inline-grid;
        grid-template-columns: 1.5ch auto;
        gap: 0.1em;
        align-items: center;
        place-content: center;
        white-space: nowrap;
        vertical-align: top;
    }

    a {
        color: var(--k-color-master);
    }
</style>
