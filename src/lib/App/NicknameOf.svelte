<script lang="ts">
    import { ensNameOf, getProfileData, ProfileInfo } from "$/tools/api/profile";
    import { onDestroy } from "svelte";

    export let address: string = null;
    let nameInfo: ProfileInfo = null;
    let ensName: string = null;
    $: name = nameInfo?.value;

    $: address, onAddressChange();
    async function onAddressChange() {
        nameInfo = null;
        ensName = null
        nameInfo?.unlisten();
        if (address) {
            await Promise.all([
                getProfileData(address, "nickname").then((value) => nameInfo = value),
                ensNameOf(address).then((value) => ensName = value)
            ])
            nameInfo.listen();
        }
    }

    onDestroy(() => nameInfo?.unlisten());
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
