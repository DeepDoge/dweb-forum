<script lang="ts">
    import About from "$/pages/about.svelte";

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
    async function search() {
        if (searchInput.startsWith("#")) location.hash = `#${$currentRoute.chainId}${searchInput.toLowerCase()}`;
        if (ethers.utils.isAddress(searchInput)) location.hash = `#${$currentRoute.chainId}#${searchInput}`;
    }

    let overlays: HTMLDivElement
    $: overlays && ($overlayMountPoint = overlays)
</script>

<Header />
<main>
    <form class="search-form" on:submit|preventDefault={search}>
        <KTextField background bind:value={searchInput} placeholder="#Topic, 0xAddress, ENS name" />
        <KButton color="master">Search</KButton>
    </form>

    <a href="#{$currentRoute.chainId}#{$currentRoute.path}#about" class="about-link">What is DForum?</a>

    <Routing />
</main>
<KModalHashRoute hash="claim-name" hashOverride={$currentRoute.hash}>
    <ClaimName on:done={() => history.back()} />
</KModalHashRoute>

<KModalHashRoute hash="settings" hashOverride={$currentRoute.hash}>
    <Settings />
</KModalHashRoute>

<KModalHashRoute hash="about" size="60em" hashOverride={$currentRoute.hash}>
    <About />
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

    .about-link {
        display: inline-block;
        margin-left: auto;
        font-weight: bold;
        color: var(--k-color-slave);
        text-decoration: underline;
        opacity: 0;
    }

    .about-link:hover {
        opacity: 1;
    }
</style>
