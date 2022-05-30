<script lang="ts">
    import AddressOf from "./AddressOf.svelte";
    import ClaimedNameOf from "./ClaimedNameOf.svelte";
    import ProfileAvatar from "./ProfileAvatar.svelte";

    export let address: string;
</script>

<div class="card">
    <div class="avatar">
        <ProfileAvatar {address} />
    </div>
    <div class="name">
        <ClaimedNameOf {address} />
    </div>
    <div class="address">
        <AddressOf {address} />
    </div>
</div>

<style>
    .card {
        width: min(15em, calc(100vw - var(--k-padding)));
    }

    .card {
        display: grid;
        grid-template-areas:
            "avatar name"
            "avatar address";
        grid-template-columns: 2em 1fr;
        gap: var(--k-padding);
    }

    .avatar {
        grid-area: avatar;
    }

    .name {
        grid-area: name;
    }

    .address {
        grid-area: address;
    }
</style>
