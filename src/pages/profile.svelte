<script lang="ts">
    import AvatarOf from "$lib/App/AvatarOf.svelte";
    import NicknameOf from "$lib/App/NicknameOf.svelte";
    import Timeline from "$lib/App/Timeline.svelte";
    import KPageContainer from "$lib/kicho-ui/components/KPageContainer.svelte";

    export let address: string;
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
            {address}
        </div>
    </div>

    <KPageContainer>
        <div class="content">
            <div class="published">
                <Timeline timelineId={{ group: 2, id: address }} />
            </div>
        </div>
    </KPageContainer>
</div>

<style>
    .profile-page {
        display: grid;
        grid-auto-flow: row;
        grid-template-columns: 1fr;
        gap: 0.5em;
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
