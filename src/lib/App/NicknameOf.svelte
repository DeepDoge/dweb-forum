<script lang="ts">
    import { getProfileData, ProfileInfo } from "$/plugins/api/profile";
    import { onDestroy } from "svelte";

    export let address: string = null;
    let nameInfo: ProfileInfo = null;
    $: name = nameInfo?.value;

    $: onAddressChange() && address;

    async function onAddressChange() {
        if (address) {
            if (nameInfo) nameInfo.unlisten();
            nameInfo = await getProfileData({ address, key: "nickname" });
            nameInfo.listen();
        }
    }

    onDestroy(() => nameInfo?.unlisten());
</script>

<span class="k-text-singleline" title={name && $name?.trim() || "Nameless"}>
    {name && $name?.trim() || "Nameless"}
</span>

<style>
    span {
        display: inline-block;
        max-width: 100%;
    }
</style>
