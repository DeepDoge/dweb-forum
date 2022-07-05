<script lang="ts">
    import { stringAsUint256 } from "$/plugins/utils/string";
    import { profileContract } from "$/plugins/wallet";
    import { catchContract } from "$/plugins/wallet/catch";
    import { waitContractUntil } from "$/plugins/wallet/listen";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import KTextField from "$lib/kicho-ui/components/KTextField.svelte";
    import { createEventDispatcher } from "svelte";
    import { account } from "$/plugins/wallet";

    const dispatcher = createEventDispatcher();

    let nickname = "";
    let claming = false;
    async function setName() {
        claming = true;
        try {
            await profileContract.setProfile(stringAsUint256("nickname"), stringAsUint256(nickname));
            await waitContractUntil(profileContract, profileContract.filters.ProfileSet($account, stringAsUint256("nickname")), () => true);
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
