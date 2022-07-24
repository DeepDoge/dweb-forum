<script lang="ts">
    import { ensNameOf } from "$/tools/api/profile";

    import { promiseQueue } from "$/utils/common/promiseQueue";

    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import { globalEventNotificationManager } from "$lib/kicho-ui/components/KEventNotification.svelte";
    export let address: string;
    let ensName: string = null;

    $: address, addressChange(address);
    const addressChange = promiseQueue(async (value: string) => {
        ensName = null;
        if (address !== value || !value) return;
        ensName = await ensNameOf(value);
    });

    $: start = ensName ? ensName.substring(0, ensName.length - ".eth".length) : address?.substring(0, 39);
    $: end = ensName ? ".eth" : address?.substring(39);
</script>

<KButton
    text
    title="Copy Address"
    on:click={() => navigator.clipboard.writeText(address).then(() => globalEventNotificationManager.append(`Copied Address: ${address}`))}
>
    <div aria-label={address} class:ens={ensName} class="address k-text-singleline" data-start={start} data-end={end} />
</KButton>

<style>
    .address {
        display: inline-grid;
        grid-template-columns: auto auto;
        justify-content: start;
    }

    .address::before {
        content: attr(data-start);
        min-width: 3.5em;
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .address::after {
        content: attr(data-end);
        white-space: nowrap;
        flex-basis: content;
    }

    .ens::after {
        background-color: var(--k-color-slave);
        padding: 0 var(--k-padding);
        border-radius: var(--k-border-radius);
    }
</style>
