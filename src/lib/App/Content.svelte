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
        <a target="_blank" href={getIpfsUrl(part.substring("image,".length))}>{part.substring("image,".length)}</a>
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
    img {
        min-width: 10rem;
        max-height: 100%;
        object-fit: contain;
        object-position: left;

        background-color: var(--k-color-mode-pop);
    }

    .image {
        float: left;
        width: 100%;
        display: grid;
        justify-content: start;
        grid-template-columns: minmax(10rem, max-content);
        grid-template-rows: 15em;
        padding: var(--k-padding);
    }

    .profile-inline {
        display: inline-grid;
        grid-template-columns: 2ch auto;
        gap: .1em;
        align-items: center;
        place-content: center;
        white-space: nowrap;
    }

    a {
        color: var(--k-color-master);
    }
</style>
