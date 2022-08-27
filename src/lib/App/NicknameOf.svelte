<script lang="ts">
    import { getProfileData, ProfileInfo } from "$/api/profile";
    import { createTheThingThatLetsYouInitializeAndFinalize_A_ValueWhenItsSetAndSomeBooelanIsTrue } from "$/utils/thing";
    import KIntersectionObserver from "$lib/kicho-ui/components/KIntersectionObserver.svelte";

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

    const thing = createTheThingThatLetsYouInitializeAndFinalize_A_ValueWhenItsSetAndSomeBooelanIsTrue<typeof nameInfo>({
        init: (value) => value.listen(),
        dispose: (value) => value.unlisten(),
    });

    $: thing.update(listen, nameInfo);
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
