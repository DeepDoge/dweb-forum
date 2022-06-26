<script context="module" lang="ts">
    import { decodeBigNumberArrayToString, stringToBigNumber } from "$/plugins/common/stringToBigNumber";
    import { appContract } from "$/plugins/wallet";
    import { listenContract } from "$/plugins/wallet/listen";
    import { onDestroy } from "svelte";
    import { writable, Writable } from "svelte/store";

    const caches: Record<
        string,
        {
            listenerCount: number;
            value: Writable<string>;
            offListener: Function | null;
        }
    > = {};

    function getName(address: string) {
        if (!address) return;
        address = address.toLowerCase();
        if (!caches[address]) {
            caches[address] = { listenerCount: 0, value: writable(null), offListener: null };
            caches[address].offListener = listenContract(
                appContract,
                appContract.filters.ProfileSet(address, stringToBigNumber("nickname")),
                (owner, key, newName) => {
                    caches[address].value.set(decodeBigNumberArrayToString([newName]));
                }
            );
            appContract
                .profiles(address, stringToBigNumber("nickname"))
                .then((value) => caches[address]?.value.set(decodeBigNumberArrayToString([value])));
        }
        caches[address].listenerCount++;
        return caches[address].value;
    }

    function dispose(address: string) {
        address = address?.toLowerCase();
        if (!caches[address]) return;
        --caches[address].listenerCount;
        const isDisposable = () => caches[address] && caches[address].listenerCount === 0;
        if (isDisposable()) {
            setTimeout(() => {
                if (isDisposable()) {
                    caches[address].offListener();
                    delete caches[address];
                }
            }, 1000);
        }
    }
</script>

<script lang="ts">
    export let address: string;
    let name: Writable<string> = null;

    let addressCache = address;
    $: onAddressChange(address);

    function onAddressChange(newAddress: string) {
        if (newAddress) {
            name = getName(newAddress);
        } else {
            dispose(addressCache);
            name = null;
        }
        addressCache = newAddress;
    }

    onDestroy(() => address && dispose(address));
</script>

<span class="k-text-singleline" title={$name?.trim() || "Nameless"}>
    {$name?.trim() || "Nameless"}
</span>

<style>
    span {
        display: inline-block;
        max-width: 100%;
    }
</style>