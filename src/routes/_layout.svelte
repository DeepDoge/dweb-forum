<script lang="ts">
    import ClaimName from "$lib/App/ClaimName.svelte";

    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import KDialog, { globalDialogManager } from "$lib/kicho-ui/components/KDialog.svelte";
    import KEventNotification, { globalEventNotificationManager } from "$lib/kicho-ui/components/KEventNotification.svelte";
    import KModalHashRoute from "$lib/kicho-ui/components/KModalHashRoute.svelte";
    import KTaskNotification, { globalTaskNotificationManager } from "$lib/kicho-ui/components/KTaskNotification.svelte";

    import KTextField from "$lib/kicho-ui/components/KTextField.svelte";
    import { ethers } from "ethers";

    import Header from "./_header.svelte";
    import { currentRoute } from "./_routing";
    import Routing from "./_routing.svelte";

    let searchInput: string;
    async function search() {
        if (searchInput.startsWith("#")) location.hash = searchInput.toLowerCase();
        if (ethers.utils.isAddress(searchInput)) location.hash = `#${searchInput}`;
    }
</script>

<Header />
<main>
    <form class="search-form" on:submit|preventDefault={search}>
        <KTextField background bind:value={searchInput} placeholder="#Topic, 0xAddress, ENS name" />
        <KButton color="master">Search</KButton>
    </form>

    <Routing />

    <KModalHashRoute hash="claim-name" hashOverride={$currentRoute.hash}>
        <ClaimName on:done={() => history.back()} />
    </KModalHashRoute>

    <KDialog dialogManager={globalDialogManager} />

    <KEventNotification eventNotificationManager={globalEventNotificationManager} />
    <KTaskNotification taskNotificationManager={globalTaskNotificationManager} />
</main>

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
