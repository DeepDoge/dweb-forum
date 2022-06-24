<script lang="ts">
    import AddressOf from "./AddressOf.svelte";
    import AvatarOf from "./AvatarOf.svelte";
    import NicknameOf from "./NicknameOf.svelte";
    
    export let address: string;
</script>

<div class="card">
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

<style>
    .card {
        min-width: min(15em, calc(100% - var(--k-padding)));
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
