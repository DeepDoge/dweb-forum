<script lang="ts">
    import { stringToBigNumber } from "$/plugins/common/stringToBigNumber";
    import { profileContract } from "$/plugins/wallet";
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
            await (await profileContract.setProfile(stringToBigNumber("nickname"), stringToBigNumber(nickname))).wait(1);
            dispatcher("done");
        } catch (error) {
            catchContract(error);
        } finally {
            claming = false;
        }
    }
</script>

<form class="claim-name-container" on:submit|preventDefault={setName}>
    <KTextField radius="rounded" bind:value={nickname} placeholder="Pick a nickname" disabled={claming} label="Claim Nickname" />
    <KButton color="gradient" radius="rounded" loading={claming}>Claim</KButton>
</form>

<style>
    .claim-name-container {
        display: grid;
        gap: 0.5em;
    }
</style>
