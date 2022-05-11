<script lang="ts">
    import { appContract } from "$/plugins/wallet";
    import { catchContract } from "$/plugins/wallet/catch";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import KTextField from "$lib/kicho-ui/components/KTextField.svelte";
    import { createEventDispatcher } from "svelte";

    const dispatcher = createEventDispatcher();

    let nickname = "";
    let claming = false;
    async function setName() {
        claming = true;
        try {
            await (await appContract.claimNickname(nickname)).wait(1);
            dispatcher("done");
        } catch (error) {
            catchContract(error);
        } finally {
            claming = false;
        }
    }
</script>

<form class="claim-name-container" on:submit|preventDefault={setName}>
    <KTextField bind:value={nickname} disabled={claming} label="Claim Name" />
    <KButton glow loading={claming}>Claim</KButton>
</form>

<style>
    .claim-name-container {
        display: grid;
        gap: 0.5em;
    }
</style>
