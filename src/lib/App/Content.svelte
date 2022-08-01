<script lang="ts">
    import { currentRoute } from "$/routes/_routing";
    import { ipfsClient } from "$/tools/ipfs/client";
    import type { PostContentData } from "$/utils/content";
    import { ContentType } from "$/utils/content";
    import KHoverMenu from "$lib/kicho-ui/components/KHoverMenu.svelte";
    import AvatarOf from "./AvatarOf.svelte";
    import ContentGallery from "./ContentGallery.svelte";
    import type ContentImage from "./ContentImage.svelte";
    import NicknameOf from "./NicknameOf.svelte";
    import ProfileMiniCard from "./ProfileMiniCard.svelte";

    export let content: PostContentData;
    export let limitHeight = false

    $: items = content?.items.filter((item) => item.type !== ContentType.IpfsImage);
    let imageItems: ContentImage["$$prop_def"][];
    $: imageItems = content?.items
        .filter((item) => item.type === ContentType.IpfsImage)
        .map((item) => ({ src: $ipfsClient.toURL(item.data), alt: item.data }));
</script>

<div class="content" class:limit-height={limitHeight}>
    <div class="text">
        {#each items ?? [] as item, i (i)}
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
            {:else if item.type === ContentType.Text}
                {#each item.data.trim().split(/(\n)/g) as part}
                    {#if part === "\n"}
                        <br />
                    {:else}
                        {part}
                    {/if}
                {/each}
            {:else if item.type === ContentType.Error}
                {#each item.data.trim().split(/(\n)/g) as part}
                    {#if part === "\n"}
                        <br />
                    {:else}
                        <span class="error">{part}</span>
                    {/if}
                {/each}
            {/if}
            {" "}
        {/each}
    </div>

    {#if imageItems?.length > 0}
        <div class="media">
            <ContentGallery items={imageItems} />
        </div>
    {/if}
</div>

<style>
    .content {
        display: grid;
        gap: calc(var(--k-padding) * 4);
    }

    .limit-height .text {
        max-height: calc(19.5em);
        overflow: hidden;
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

    .error {
        color: var(--k-color-error);
    }
</style>
