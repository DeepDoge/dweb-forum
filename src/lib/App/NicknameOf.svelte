<script lang="ts">
    import { getProfileData,ProfileInfo } from "$/tools/api/profile";
    import { disposableReadable } from "$/utils/disposableReadable";
    import KIntersectionObserver from "$lib/kicho-ui/components/KIntersectionObserver.svelte";
    import { writable } from "svelte/store";

    export let address: string = null;
    let nameInfo: ProfileInfo = null;
    $: name = nameInfo?.value;

    $: address, onAddressChange();
    async function onAddressChange() {
        nameInfo = null;
        if (address) nameInfo = await getProfileData(address, "nickname");
    }

    let intersecting = false;
    $: listen = intersecting;

    const listen_ = writable(listen);
    $: listen_.set(listen);
    const nameInfo_ = writable(nameInfo);
    $: nameInfo_.set(nameInfo);

    disposableReadable({
        active: listen_,
        value: nameInfo_,
        init(value) {
            value.listen();
        },
        dispose(value) {
            value.unlisten();
        },
    });
</script>

<KIntersectionObserver bind:intersecting>
    <span class="k-text-singleline">
        {(name && $name?.trim()) || "Nameless"}
    </span>
</KIntersectionObserver>

<style>
    span {
        display: inline-block;
        max-width: 100%;
    }
</style>
