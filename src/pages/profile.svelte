<script context="module" lang="ts">
    export const profilePageTabs = Object.freeze({
        "": { name: "Posts", mode: 0 },
        replies: { name: "Replies", mode: 1 },
        mentions: { name: "Mentions", mode: 2 },
    } as const);
    export type ProfilePageTabsKey = Extract<keyof typeof profilePageTabs, string>;
    export const profilePageTabsKeys: readonly ProfilePageTabsKey[] = Object.freeze(Object.keys(profilePageTabs)) as any

    const tabsEntries = Object.entries(profilePageTabs)
</script>

<script lang="ts">
    import AddressOf from "$lib/App/AddressOf.svelte";
    import AvatarOf from "$lib/App/AvatarOf.svelte";
    import NicknameOf from "$lib/App/NicknameOf.svelte";
    import Timeline from "$lib/App/Timeline.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import { route } from "$/routes/_routing.svelte"

    export let address: string;
    export let modeKey: ProfilePageTabsKey

    $: mode = profilePageTabs[modeKey].mode;
</script>

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
            <Timeline timelineId={{ group: mode, id: address }}>
                <svelte:fragment slot="timeline-header">
                    <div class="tabs">
                        {#each tabsEntries as [path, tab] (path)}
                            <KButton href="#{address}/{path}#{$route.hash}" color="master" background={tab.mode === mode}>{tab.name}</KButton>
                        {/each}
                    </div>
                </svelte:fragment>
            </Timeline>
        </div>
    </div>
</div>

<style>
    .profile-page {
        display: grid;
        grid-auto-flow: row;
        grid-template-columns: 1fr;
        gap: 0.5em;
    }

    .tabs {
        display: grid;
        grid-auto-flow: column;
        gap: calc(var(--k-padding) * 2);
    }
    .profile {
        display: flex;
        gap: 0.5em;
        align-items: center;
        flex-direction: column;
        padding: var(--k-page-padding);
        padding-top: 0;
        padding-bottom: 0;
    }

    .avatar {
        width: min(10em, 100% - 1em);
        aspect-ratio: 1 / 1;
        background-color: var(--k-color-master);
        border-radius: 10000%;
    }

    .name {
        display: grid;
        font-weight: bold;
        font-size: 2rem;
    }
</style>
