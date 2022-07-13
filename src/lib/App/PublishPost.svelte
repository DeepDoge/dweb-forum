<script lang="ts">
    import { getPostData, packTimelineId, TimelineGroup, TimelineId } from "$/tools/api/app";
    import { ipfsClient } from "$/tools/ipfs/client";
    import { account, appContract } from "$/tools/wallet";
    import { waitContractUntil } from "$/tools/wallet/listen";
    import { utf8AsBytes32 } from "$/utils/bytes";
    import { encodeContent, parseContent } from "$/utils/content";
    import KBoxEffect from "$lib/kicho-ui/components/effects/KBoxEffect.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import { globalDialogManager } from "$lib/kicho-ui/components/KDialog.svelte";
    import KModal from "$lib/kicho-ui/components/KModal.svelte";
    import { globalTaskNotificationManager } from "$lib/kicho-ui/components/KTaskNotification.svelte";
    import KTextField from "$lib/kicho-ui/components/KTextField.svelte";
    import { BigNumber } from "ethers";
    import { get } from "svelte/store";
    import AvatarOf from "./AvatarOf.svelte";
    import Content from "./Content.svelte";
    import NicknameOf from "./NicknameOf.svelte";

    export let timelineId: TimelineId;
    $: reply = timelineId.group === TimelineGroup.Replies;

    let titleText: string;
    let contentText: string;
    $: content = contentText?.length > 0 ? parseContent($account, contentText) : null;
    $: encodedContent = content ? encodeContent(content) : null;
    $: length = encodedContent?.itemsData.length ?? 0;

    async function publish() {
        try {
            const content = encodeContent(
                parseContent(
                    $account,
                    contentText,
                    BigNumber.from(timelineId.group).eq(TimelineGroup.Replies)
                        ? [get(await getPostData({ postId: BigNumber.from(timelineId.key) })).owner].filter(
                              (mention) => mention.toLowerCase() !== $account
                          )
                        : []
                )
            );

            const tx = await globalTaskNotificationManager.append(
                appContract.publishPost(timelineId.group, timelineId.key, utf8AsBytes32(titleText?.trim()), content.itemsData, content.mentions),
                "Awaiting Publish Confirmation"
            );

            showPostPreview = false;
            setTimeout(() => {
                titleText = null;
                contentText = null;
            }, 500);

            await globalTaskNotificationManager.append(
                waitContractUntil(
                    appContract,
                    appContract.filters.TimelineAddPost(packTimelineId(timelineId)),
                    (x, y, z, w, event) => tx.hash === event.transactionHash
                ),
                "Publishing Post"
            );
        } catch (error) {
            await globalDialogManager.alert(error.message);
            throw error;
        }
    }

    let uploadElement: HTMLInputElement = null;
    let uploadingFile = false;

    let showPostPreview = false;

    $: busy = uploadingFile;
</script>

<svelte:head>
    <input
        bind:this={uploadElement}
        type="file"
        on:change={async (event) => {
            uploadingFile = true;

            if (!(await globalDialogManager.confirm(`Are you sure you wanna upload "${uploadElement.files[0].name}"?`))) return;

            try {
                await globalTaskNotificationManager.append(
                    (async () => {
                        const pinned = await $ipfsClient.api.add(uploadElement.files[0], { pin: true });
                        if (contentText && !/\s/.test(contentText[contentText.length - 1])) contentText += " ";
                        contentText = `${contentText ?? ""}${uploadElement.files[0].type.startsWith("image/") ? "image," : ""}${pinned.cid.toV0()}`;
                    })(),
                    `Uploading file (${uploadElement.files[0].name}) to IPFS`
                );
            } catch (err) {
                globalDialogManager.alert("There was an error while uploading the file.");
                console.error(err);
            } finally {
                uploadingFile = false;
            }
        }}
    />
</svelte:head>

{#if $account}
    <KModal bind:active={showPostPreview}>
        <form class="preview" on:submit|preventDefault={publish}>
            <b>Preview</b>
            <div class="fields">
                <KBoxEffect color="mode" background radius="rounded">
                    <div class="content-field">
                        <div class="avatar">
                            <AvatarOf address={$account} />
                        </div>
                        <div class="nickname">
                            <NicknameOf address={$account} />
                        </div>
                        <div class="field k-text-multiline">
                            {#if titleText}
                                <div>
                                    <b>{titleText}</b>
                                </div>
                            {/if}
                            <Content {content} />
                        </div>
                    </div>
                </KBoxEffect>
            </div>
            <div class="actions">
                <input type="submit" style="opacity:0;position:absolute;pointer-events:none;width:0;height:0" />
                <KButton color="master" radius="rounded" disabled={busy}>Confirm</KButton>
            </div>
        </form>
    </KModal>

    <!-- svelte-ignore missing-declaration -->
    <form on:submit|preventDefault={() => (showPostPreview = true)} class="publish-form" class:reply class:empty={!contentText}>
        <KBoxEffect color="mode" background radius="rounded">
            <div class="fields">
                {#if !reply}
                    <KTextField bind:value={titleText} size="x-larger" background={false} placeholder="Title" />
                {/if}
                <div class="content-field">
                    <div class="avatar">
                        <AvatarOf address={$account} />
                    </div>
                    <div class="nickname">
                        <NicknameOf address={$account} />
                    </div>
                    <div class="field">
                        <!-- {encodedContent && bytesToUtf8(encodedContent.itemsData)} -->
                        <KTextField
                            compact
                            background={false}
                            type="textarea"
                            bind:value={contentText}
                            placeholder={reply ? "Reply..." : "Say something..."}
                        />
                        <div class="byte-size">
                            {length} bytes
                        </div>
                    </div>
                </div>
            </div>
            <hr />
            <div class="actions">
                <input type="submit" style="opacity:0;position:absolute;pointer-events:none;width:0;height:0" />
                <KButton
                    loading={uploadingFile}
                    color="mode-pop"
                    radius="fab"
                    disabled={busy}
                    on:click={(e) => {
                        e.preventDefault();
                        uploadElement.click();
                    }}>🎞</KButton
                >
                <KButton color="master" radius="rounded" disabled={busy}>
                    <div class="publish-button-inner">
                        <svg x="0px" y="0px" viewBox="0 0 512 512" fill="currentColor">
                            <path
                                d="M268.191,0C133.754,0,24.381,109.373,24.381,243.81c0,34.621,7.07,67.95,21.016,99.206L1.17,480.134
			c-2.999,9.338-0.122,19.578,7.339,25.99c4.51,3.852,10.167,5.876,15.872,5.876c3.706,0,7.461-0.853,10.898-2.56l98.865-49.445
			c0.439,0.244,0.853,0.463,1.292,0.707c33.451,16.628,94.964,26.917,132.754,26.917c134.437,0,243.81-109.373,243.81-243.81
			S402.627,0,268.191,0z"
                            />
                        </svg>
                        {reply ? "Reply" : "Post"}
                    </div>
                </KButton>
            </div>
        </KBoxEffect>
    </form>
{:else}
    You need to connect with a Web3 wallet to be able to post.
{/if}

<style>
    .publish-button-inner {
        display: grid;
        grid-template-columns: 1.5ch auto;
        align-items: center;
        gap: var(--k-padding);
    }

    .publish-form {
        display: grid;
        gap: calc(var(--k-padding) * 2);
        padding: calc(var(--k-padding) * 2);
    }

    .fields {
        display: grid;
        gap: calc(var(--k-padding) * 2);
    }

    .preview {
        display: grid;
        gap: calc(var(--k-padding) * 2);
    }

    .preview .fields {
        padding: calc(var(--k-padding) * 2);
    }

    .actions {
        display: grid;
        justify-content: end;
        grid-auto-flow: column;
        gap: calc(var(--k-padding) * 2);
    }

    .byte-size {
        font-size: var(--k-font-smaller);
    }

    .reply:not(:focus-within):not(.publishing).empty .actions,
    .reply:not(:focus-within):not(.publishing).empty hr {
        display: none;
    }
    .reply:not(:focus-within):not(.publishing).empty .field {
        max-height: 1.5em;
        overflow: hidden;
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
