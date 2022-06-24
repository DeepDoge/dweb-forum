<script lang="ts">
    import AddressOf from "./AddressOf.svelte";
    import NicknameOf from "./NicknameOf.svelte";
    
    export let address: string;
</script>

<div class="profile">
    <span class="nickname k-text-singleline">
        <NicknameOf {address} />
    </span>
    <span class="address k-text-singleline">
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
