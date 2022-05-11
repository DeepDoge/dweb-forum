<script lang="ts">
    import { appContract,provider } from "$/plugins/wallet";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import KDialog,{ createDialogManager } from "$lib/kicho-ui/components/KDialog.svelte";
import KLoading from "$lib/kicho-ui/components/KLoading.svelte";
    import KTextField from "$lib/kicho-ui/components/KTextField.svelte";
    import { createEventDispatcher } from "svelte";

    const dispatchEvent = createEventDispatcher();
    const dialogManager = createDialogManager();

    let publishing = false;
    async function publish(params: { content: string }) {
        try {
            publishing = true;
            const gasPrice = await $provider.getGasPrice();
            await (await appContract.publishPost({ idType: 0, id: 0 }, params.content, {
                value: gasPrice
                    .mul(2)
                    .mul(await appContract.PUBLISH_GAS())
                    .mul(100)
                    .div(99),
                gasPrice,
            })).wait(1);

            dispatchEvent("done");
        } catch (error) {
            await dialogManager.alert(error.message);
        } finally {
            publishing = false;
        }
    }
</script>

<KDialog {dialogManager} />
<!-- svelte-ignore missing-declaration -->
<form on:submit|preventDefault={(e) => publish({ content: new FormData(e.currentTarget).get("content").toString() })} class="publish-post">
    <KTextField type="textarea" name="content" disabled={publishing} label="Content" />
    <KButton size="larger" disabled={publishing}>
        {#if publishing}
            <KLoading />
        {:else}
            Post
        {/if}    
    </KButton>
</form>

<style>
    form {
        display: grid;
        gap: 0.5em;
    }
</style>
