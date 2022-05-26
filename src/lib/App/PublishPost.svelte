<script lang="ts">
    import type { TimelineId } from "$/plugins/api";
    import { account, appContract, provider } from "$/plugins/wallet";
    import KBoxEffect from "$lib/kicho-ui/components/effects/KBoxEffect.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import KDialog, { createDialogManager } from "$lib/kicho-ui/components/KDialog.svelte";
    import KTextField from "$lib/kicho-ui/components/KTextField.svelte";
    import { createEventDispatcher } from "svelte";

    const dispatchEvent = createEventDispatcher();
    const dialogManager = createDialogManager();

    export let timelineId: TimelineId;

    let publishing = false;
    async function publish(params: { content: string }) {
        try {
            publishing = true;
            const gasPrice = await $provider.getGasPrice();
            await (
                await appContract.publishPost(timelineId, params.content, {
                    value: gasPrice
                        .mul(2)
                        .mul(await appContract.PUBLISH_GAS())
                        .mul(100)
                        .div(99),
                    gasPrice,
                })
            ).wait(1);

            dispatchEvent("done");
        } catch (error) {
            await dialogManager.alert(error.message);
        } finally {
            publishing = false;
        }
    }
</script>

<KDialog {dialogManager} />

{#if $account}
    <!-- svelte-ignore missing-declaration -->
    <form on:submit|preventDefault={(e) => publish({ content: new FormData(e.currentTarget).get("content").toString() })} class="publish-post">
        <KBoxEffect color="mode" blur background radius="rounded">
            <div class="fields">
                <KTextField type="textarea" name="content" radius="rounded" disabled={publishing} placeholder="Say something..." />
            </div>
            <div class="actions">
                <KButton color="mode-contrast" size="larger" radius="rounded" loading={publishing}>Publish</KButton>
            </div>
        </KBoxEffect>
    </form>
{:else}
    You need to connect with a Web3 wallet to be able to post.
{/if}

<style>
    form {
        display: grid;
        gap: 0.75em;
        padding: calc(var(--k-padding) * 4) calc(var(--k-padding) * 2);
    }

    .fields {
        display: grid;
        gap: 0.25em;
    }

    .actions {
        display: grid;
        justify-content: end;
        grid-auto-flow: row;
        gap: 0.25em;
        padding: 0 var(--k-padding);
    }
</style>
