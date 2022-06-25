<script lang="ts">
    import AddressOf from "$lib/App/AddressOf.svelte";
    import AvatarOf from "$lib/App/AvatarOf.svelte";
    import NicknameOf from "$lib/App/NicknameOf.svelte";
    import Posts from "$lib/App/Posts.svelte";
    import Timeline from "$lib/App/Timeline.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";

    export let address: string;

    const enum Mode {
        Posts = 0,
        Replies = 1,
        Mentions = 2,
    }

    export let mode: Mode = Mode.Posts;

    const tabs: {
        name: string;
        mode: Mode;
    }[] = [
        { name: "Posts", mode: Mode.Posts },
        { name: "Replies", mode: Mode.Replies },
        { name: "Mentions", mode: Mode.Mentions },
    ];
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
                        {#each tabs as tab (tab.mode)}
                            <KButton on:click={() => (mode = tab.mode)} color="master" background={tab.mode === mode}>{tab.name}</KButton>
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

    .content {
        padding: var(--k-page-padding);
    }

    .profile {
        display: flex;
        gap: 0.5em;
        align-items: center;
        flex-direction: column;
    }

    .avatar {
        width: min(10em, 100% - 1em);
        aspect-ratio: 1 / 1;
        background-color: var(--k-color-master);
        border-radius: 10000%;
    }

    .name {
        font-weight: bold;
        font-size: 2rem;
    }
</style>
