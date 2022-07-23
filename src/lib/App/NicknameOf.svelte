<script lang="ts">
    import { ensNameOf, getProfileData, ProfileInfo } from "$/tools/api/profile";
    import { onDestroy } from "svelte";

    export let address: string = null;
    let nameInfo: ProfileInfo = null;
    $: name = nameInfo?.value;

    $: address, onAddressChange();
    async function onAddressChange() {
        nameInfo = null;
        nameInfo?.unlisten();
        if (address) {
            await getProfileData(address, "nickname").then((value) => nameInfo = value)
            nameInfo.listen();
        }
    }

    onDestroy(() => nameInfo?.unlisten());
</script>

<span class="k-text-singleline">
    {(name && $name?.trim()) || "Nameless"}
</span>

<style>
    span {
        display: inline-block;
        max-width: 100%;
    }
</style>
