<script lang="ts">
    import type { TimelineId } from "$/plugins/api/timeline";
    import { isValidIpfsHash } from "$/plugins/common/isValidIpfsHash";
    import { encodePostContent, stringToBigNumber } from "$/plugins/common/stringToBigNumber";
    import { account, appContract, provider } from "$/plugins/wallet";
    import KBoxEffect from "$lib/kicho-ui/components/effects/KBoxEffect.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import KDialog, { createDialogManager } from "$lib/kicho-ui/components/KDialog.svelte";
    import KTextField from "$lib/kicho-ui/components/KTextField.svelte";
    import CID from "cids";
    import { createEventDispatcher } from "svelte";
    import AvatarOf from "./AvatarOf.svelte";
    import NicknameOf from "./NicknameOf.svelte";

    const dispatchEvent = createEventDispatcher();
    const dialogManager = createDialogManager();

    export let timelineId: TimelineId;
    export let reply = false;

    let publishing = false;
    async function publish(params: { title: string; content: string }) {
        try {
            let content = "";
            const parts = params.content?.split(/([\s,]+)/) ?? [];
            for (const part of parts)
                if (isValidIpfsHash(part) && part.startsWith("bafy")) content += new CID(part).toV0().toString();
                else content += part;

            publishing = true;
            const gasPrice = await $provider.getGasPrice();
            await (
                await appContract.publishPost(
                    timelineId.group,
                    timelineId.id,
                    stringToBigNumber(params.title.trim()),
                    encodePostContent(content),
                    [
                        `0x${"0".repeat(40)}`,
                        `0x${"0".repeat(40)}`,
                        `0x${"0".repeat(40)}`,
                        `0x${"0".repeat(40)}`,
                        `0x${"0".repeat(40)}`,
                        `0x${"0".repeat(40)}`,
                        `0x${"0".repeat(40)}`,
                        `0x${"0".repeat(40)}`,
                    ],
                    {
                        value: gasPrice
                            .mul(2)
                            .mul(await appContract.PUBLISH_GAS())
                            .mul(100)
                            .div(99),
                        gasPrice,
                    }
                )
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
    <form
        on:submit|preventDefault={(e) =>
            publish({
                title: new FormData(e.currentTarget).get("title").toString(),
                content: new FormData(e.currentTarget).get("content").toString(),
            }) && e.currentTarget.reset()}
        class="publish-post"
    >
        <KBoxEffect color="mode" background radius="rounded">
            <div class="fields">
                {#if !reply}
                    <KTextField disabled={publishing} size="x-larger" background={false} type="text" name="title" placeholder="Title" />
                {/if}
                <div class="content-field">
                    <div class="avatar">
                        <AvatarOf address={$account} />
                    </div>
                    <div class="nickname">
                        <NicknameOf address={$account} />
                    </div>
                    <div class="field">
                        <KTextField disabled={publishing} compact background={false} type="textarea" name="content" placeholder="Say something..." />
                    </div>
                </div>
            </div>
            <hr />
            <div class="actions">
                <input type="submit" style="opacity:0;position:absolute;pointer-events:none;width:0;height:0" />
                <KButton color="mode-pop" radius="fab" disabled={publishing} on:click={(e) => e.preventDefault()}>🎞</KButton>
                <KButton color="master" radius="rounded" loading={publishing}>🗨 {reply ? 'Reply' :  'Post'}</KButton>
            </div>
        </KBoxEffect>
    </form>
{:else}
    You need to connect with a Web3 wallet to be able to post.
{/if}

<style>
    form {
        display: grid;
        gap: calc(var(--k-padding) * 2);
        padding: calc(var(--k-padding) * 2);
    }

    .fields {
        display: grid;
        gap: calc(var(--k-padding) * 2);
    }

    .actions {
        display: grid;
        justify-content: end;
        grid-auto-flow: column;
        gap: calc(var(--k-padding) * 2);
    }

    .content-field {
        display: grid;
        gap: calc(var(--k-padding) * 2);
        grid-template-columns: 2em 1fr;
        grid-template-rows: auto auto;
        grid-template-areas:
            "avatar nickname"
            "avatar field";
    }

    .content-field > .avatar {
        grid-area: avatar;
    }
    .content-field > .nickname {
        grid-area: nickname;
        font-size: var(--k-font-x-smaller);
    }
    .content-field > .field {
        grid-area: field;
    }
</style>
