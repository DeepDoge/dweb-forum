<script lang="ts">
    import { getIpfsUrl } from "$/utils/ipfsUrl";
    import type { Content } from "$/utils/content";
    import { ContentType } from "$/utils/content";
    import KHoverMenu from "$lib/kicho-ui/components/KHoverMenu.svelte";
    import AvatarOf from "./AvatarOf.svelte";
    import NicknameOf from "./NicknameOf.svelte";
    import ProfileMiniCard from "./ProfileMiniCard.svelte";

    export let content: Content;
</script>

{#each content?.items ?? [] as item, i (i)}
    {" "}
    {#if item.type === ContentType.Mention}
        <a data-address={content.mentions[item.data]} class="profile-inline" href="#{content.mentions[item.data]}">
            <AvatarOf address={content.mentions[item.data]} />
            <div class="no-select">
                <NicknameOf address={content.mentions[item.data]} />
                <KHoverMenu background>
                    <ProfileMiniCard address={content.mentions[item.data]} />
                </KHoverMenu>
            </div>
        </a>
    {:else if item.type === ContentType.IpfsLink}
        <a target="_blank" href={getIpfsUrl(item.data)}>{item.data}</a>
    {:else if item.type === ContentType.IpfsImage}
        <div class="image">
            <a target="_blank" href={getIpfsUrl(item.data)}>
                <img alt={item.data} src={getIpfsUrl(item.data)} />
            </a>
        </div>
    {:else if item.type === ContentType.Text}
        {#each item.data.split("\n") as part}
            {#if part === "\n"}
                <br />
            {:else}
                {part}
            {/if}
        {/each}
    {/if}
    {" "}
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
