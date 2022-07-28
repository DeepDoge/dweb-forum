<script lang="ts">
    import { currentRoute } from "$/routes/_routing";
    import { ipfsClient } from "$/tools/ipfs/client";
    import type { PostContentData } from "$/utils/content";
    import { ContentType } from "$/utils/content";
    import KHoverMenu from "$lib/kicho-ui/components/KHoverMenu.svelte";
    import AvatarOf from "./AvatarOf.svelte";
    import ImageAi from "./ImageAI.svelte";
    import NicknameOf from "./NicknameOf.svelte";
    import ProfileMiniCard from "./ProfileMiniCard.svelte";

    export let content: PostContentData;
</script>

{#each content?.items ?? [] as item, i (i)}
    {" "}
    {#if item.type === ContentType.Mention}
        <a data-address={content.mentions[item.data]} class="profile-inline" href="#{$currentRoute.chainId}#{content.mentions[item.data]}">
            <AvatarOf address={content.mentions[item.data]} />
            <div class="no-select">
                <NicknameOf address={content.mentions[item.data]} />
                <KHoverMenu background>
                    <ProfileMiniCard address={content.mentions[item.data]} />
                </KHoverMenu>
            </div>
        </a>
    {:else if item.type === ContentType.IpfsLink}
        <a target="_blank" href={$ipfsClient.toURL(item.data)}>{item.data}</a>
    {:else if item.type === ContentType.IpfsImage}
        <a target="_blank" href={$ipfsClient.toURL(item.data)}>
            <div class="image">
                <ImageAi alt={item.data} src={$ipfsClient.toURL(item.data)} />
            </div>
        </a>
    {:else if item.type === ContentType.Text}
        {#each item.data.split(/(\n)/g) as part}
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
    .image {
        display: grid;
        justify-content: stretch;
        align-content: stretch;
        padding: var(--k-padding);
        width: 20em;
        aspect-ratio: 16/9;
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
        display: inline-block;
        color: var(--k-color-master);
        width: auto;
    }
</style>
