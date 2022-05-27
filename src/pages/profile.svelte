<script lang="ts">
    import { page } from "$app/stores";
    import ClaimedNameOf from "$lib/App/ClaimedNameOf.svelte";

    export let address: string
</script>

<div class="profile-page">
    <div class="profile">
        <div class="avatar" />
        <div class="name">
            <ClaimedNameOf {address} />
        </div>
        <div class="address">
            {address}
        </div>
    </div>

    <div class="content">
        <div class="published" />
    </div>
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
