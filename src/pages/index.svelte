<script lang="ts">
    import { isValidAddress } from "$/plugins/common/isValidAddress";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import KTextField from "$lib/kicho-ui/components/KTextField.svelte";
    import { BigNumber } from "ethers";

    let searchInput: string;
    async function search() {
        if (/^\d+$/.test(searchInput)) location.hash = `##post:${BigNumber.from(searchInput)}`;
        if (searchInput.startsWith("#")) location.hash = searchInput;
        if (isValidAddress(searchInput)) location.hash = `#${searchInput}`;
    }
</script>

<div id="page">
    <form class="search-form" on:submit|preventDefault={search}>
        <KTextField color="gradient" border bind:value={searchInput} placeholder="#Topic, 0xAddress, ENS name, PostIndex" />
        <KButton color="gradient">Search</KButton>
    </form>
</div>

<style>
    #page {
        display: grid;
        grid-auto-flow: row;
        grid-template-columns: 1fr;
        gap: 0.5em;

        justify-content: center;
        grid-template-columns: min(50em, 100%);
    }

    .search-form {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: .5em;
    }
</style>
