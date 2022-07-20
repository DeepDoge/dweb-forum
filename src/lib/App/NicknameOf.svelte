<script lang="ts">
    import { getProfileData, ProfileInfo } from "$/tools/api/profile";
    import { onDestroy } from "svelte";

    export let address: string = null;
    let nameInfo: ProfileInfo = null;
    let ensName: string = null;
    $: name = nameInfo?.value;

    $: address, onAddressChange();
    async function onAddressChange() {
        nameInfo = null;

        if (address) {
            nameInfo?.unlisten?.call(null);
            nameInfo = await getProfileData(address, "nickname");
            nameInfo.listen();
        }
    }

    onDestroy(() => nameInfo?.unlisten?.call(null));
</script>

<span class="k-text-singleline" title={(name && $name?.trim()) || (ensName ?? "Nameless")}>
    {(name && $name?.trim()) || (ensName ?? "Nameless")}
</span>

<style>
    span {
        display: inline-block;
        max-width: 100%;
    }
</style>
