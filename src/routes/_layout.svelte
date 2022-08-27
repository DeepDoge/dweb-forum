<script lang="ts">
    import { ensResolve } from "$/api/profile";

    import ClaimName from "$lib/App/ClaimName.svelte";
    import Settings from "$lib/App/Settings.svelte";

    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import KDialog, { globalDialogManager } from "$lib/kicho-ui/components/KDialog.svelte";
    import KEventNotification, { globalEventNotificationManager } from "$lib/kicho-ui/components/KEventNotification.svelte";
    import KModalHashRoute from "$lib/kicho-ui/components/KModalHashRoute.svelte";
    import { overlayMountPoint } from "$lib/kicho-ui/components/KOverlay.svelte";
    import KTaskNotification, { globalTaskNotificationManager } from "$lib/kicho-ui/components/KTaskNotification.svelte";

    import KTextField from "$lib/kicho-ui/components/KTextField.svelte";
    import { ethers } from "ethers";

    import Header from "./_header.svelte";
    import { currentRoute } from "./_routing";
    import Routing from "./_routing.svelte";

    let searchInput: string;
    let searching = false;
    async function search() {
        if (searching) return;
        searching = true;
        if (searchInput.startsWith("#")) location.hash = `#${$currentRoute.chainId}${searchInput.toLowerCase()}`;
        if (ethers.utils.isAddress(searchInput)) location.hash = `#${$currentRoute.chainId}#${searchInput}`;
        if (searchInput.endsWith(".eth")) location.hash = `#${$currentRoute.chainId}#${await ensResolve(searchInput)}`;
        searching = false;
    }

    let overlays: HTMLDivElement;
    $: overlays && ($overlayMountPoint = overlays);
</script>

<Header />
<main>
    <form class="search-form" on:submit|preventDefault={search}>
        <KTextField disabled={searching} background bind:value={searchInput} placeholder="#Topic, 0xAddress, ENS name" />
        <KButton color="master" loading={searching}>Search</KButton>
    </form>

    <Routing />
</main>
<KModalHashRoute hash="claim-name" hashOverride={$currentRoute.hash}>
    <ClaimName on:done={() => history.back()} />
</KModalHashRoute>

<KModalHashRoute hash="settings" hashOverride={$currentRoute.hash}>
    <Settings />
</KModalHashRoute>

<div bind:this={overlays} id="overlays" />

<KDialog dialogManager={globalDialogManager} />

<KEventNotification eventNotificationManager={globalEventNotificationManager} />
<KTaskNotification taskNotificationManager={globalTaskNotificationManager} />

<style>
    main {
        display: grid;
        gap: calc(var(--k-padding) * 5);
    }
    .search-form {
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: stretch;
        gap: 0.5em;
        margin: auto;
        width: var(--k-page-width);
        padding: var(--k-page-padding);
    }
</style>
