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
        <a data-address={part} class="profile-inline" href="#{part}">
            <AvatarOf address={part} />
            <div class="no-select">
                <NicknameOf address={part} />
                <KHoverMenu>
                    <ProfileMiniCard address={part} />
                </KHoverMenu>
            </div>
        </a>
    {:else if isValidIpfsHash(part)}
        <a target="_blank" href={getIpfsUrl(part)}>{part}</a>
    {:else if part.startsWith("img,") && isValidIpfsHash(part.substring("img,".length))}
        <div class="image">
            <a target="_blank" href={getIpfsUrl(part.substring("img,".length))}>
                <img alt={part} src={getIpfsUrl(part.substring("img,".length))} />
            </a>
        </div>
    {:else if part === "\n"}
        {part}<br />
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
        background-color: var(--k-color-mode);
        overflow: hidden;
    }

    .image {
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

    .no-select {
        display: contents;
    }
    .no-select :global(*) {
        user-select: none;
    }

    a {
        color: var(--k-color-master);
    }
</style>
