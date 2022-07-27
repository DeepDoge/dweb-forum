<script context="module" lang="ts">
    export const profilePageTabs = Object.freeze({
        "": { name: "Posts", mode: TimelineGroup.ProfilePosts },
        replies: { name: "Replies", mode: TimelineGroup.ProfileReplies },
        mentions: { name: "Mentions", mode: TimelineGroup.ProfileMentions },
    } as const);
    export type ProfilePageTabsKey = Extract<keyof typeof profilePageTabs, string>;
    export const profilePageTabsKeys: readonly ProfilePageTabsKey[] = Object.freeze(Object.keys(profilePageTabs)) as any;

    const tabsEntries = Object.entries(profilePageTabs);
</script>

<script lang="ts">
    import { currentRoute } from "$/routes/_routing";
    import { TimelineGroup } from "$/tools/api/feed";
    import { pageTitle } from "$/utils/pageTitle";
    import AddressOf from "$lib/App/AddressOf.svelte";
    import AvatarOf from "$lib/App/AvatarOf.svelte";
    import NicknameOf from "$lib/App/NicknameOf.svelte";
    import TimelinePage from "$lib/App/TimelinePage.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";

    export let address: string;
    export let modeKey: ProfilePageTabsKey;

    $: mode = profilePageTabs[modeKey].mode;
</script>

<svelte:head>
    <title>{pageTitle(address)}</title>
</svelte:head>

<div class="profile-page">
    <div class="profile">
        <div class="avatar">
            <AvatarOf {address} />
        </div>
        <div class="name">
            <NicknameOf {address} />
        </div>
        <div class="address">
            <AddressOf {address} />
        </div>
    </div>

    <div class="content">
        <div class="posts">
            <TimelinePage timelineId={{ group: mode, key: address }}>
                <svelte:fragment slot="timeline-header">
                    <div class="tabs">
                        {#each tabsEntries as [path, tab] (path)}
                            <KButton href="#{$currentRoute.chainId}#{address}/{path}#{$currentRoute.hash}" color="master" background={tab.mode === mode}>{tab.name}</KButton>
                        {/each}
                    </div>
                </svelte:fragment>
            </TimelinePage>
        </div>
    </div>
</div>

<style>
    .profile-page {
        display: grid;
        grid-auto-flow: row;
        grid-template-columns: 1fr;
        gap: calc(var(--k-padding) * 1);
    }

    .tabs {
        display: grid;
        grid-auto-flow: column;
        gap: calc(var(--k-padding) * 2);
    }
    .profile {
        display: grid;
        grid-template-columns: 6em auto;
        grid-template-areas:
            "avatar ."
            "avatar nickname"
            "avatar address"
            "avatar .";
        justify-content: start;
        justify-items: start;
        align-items: center;

        gap: calc(var(--k-padding) * 2);

        padding: var(--k-page-padding);
        padding-top: calc(var(--k-padding) * 10);
        padding-bottom: calc(var(--k-padding) * 10);
    }

    .avatar {
        grid-area: avatar;
        width: 100%;
        aspect-ratio: 1 / 1;
        background-color: var(--k-color-master);
        border-radius: var(--k-border-radius-fab);
    }

    .name {
        grid-area: nickname;
        display: grid;
        font-weight: bold;
        font-size: var(--k-font-larger);
    }

    .address {
        grid-area: address;
    }
</style>
