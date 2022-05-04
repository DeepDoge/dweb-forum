<script lang="ts">
    import { appContract, provider } from "$/plugins/wallet";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import KTextField from "$lib/kicho-ui/components/KTextField.svelte";
    import { createEventDispatcher } from "svelte";

    const dispatchEvent = createEventDispatcher();

    let publishing = false;
    async function publish(params: { content: string }) {
        publishing = true;
        const gasPrice = await $provider.getGasPrice();
        await appContract.publishPost(params.content, {
            value: gasPrice
                .mul(2)
                .mul(await appContract.PUBLISH_GAS())
                .mul(100)
                .div(99),
            gasPrice,
        });
        dispatchEvent("done");
        publishing = false;
    }
</script>

<!-- svelte-ignore missing-declaration -->
<form on:submit|preventDefault={(e) => publish({ content: new FormData(e.currentTarget).get("content").toString() })} class="publish-post">
    <KTextField name="content" disabled={publishing} label="Content" />
    <KButton disabled={publishing}>{publishing ? "Posting..." : "Post"}</KButton>
</form>

<style>
    form {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5em;
    }
</style>
