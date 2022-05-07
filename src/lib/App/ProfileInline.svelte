<script lang="ts">
    import AddressOf from "./AddressOf.svelte";
    import ClaimedNameOf from "./ClaimedNameOf.svelte";

    export let address: string;
</script>

<div class="profile">
    <span class="nickname text-inline">
        <ClaimedNameOf {address} />
    </span>
    <span class="address text-inline">
        <AddressOf {address} />
    </span>
</div>

<style>
    .profile {
        display: grid;
    }

    .nickname {
        font-weight: bold;
    }

    .address {
        font-size: var(--k-font-xx-smaller);
    }
</style>
