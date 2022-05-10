<script context="module" lang="ts">
    const caches: Record<
        string,
        {
            listenerCount: number;
            value: Writable<string>;
            offListener: Function | null;
        }
    > = {};

    function getName(address: string) {
        address = address?.toLowerCase();
        if (!caches[address]) {
            console.log(address, "new");
            caches[address] = { listenerCount: 0, value: writable(null), offListener: null };
            caches[address].offListener = listenContract(appContract, appContract.filters.NicknameClaimed(address), (owner, newName, event) =>
                caches[address].value.set(newName)
            );
            appContract.walletToNicknameMap(address).then((value) => caches[address].value.set(value));
        }
        caches[address].listenerCount++;
        console.log("a", caches);
        return caches[address].value;
    }

    function dispose(address: string) {
        address = address?.toLowerCase();
        console.log("before dispose", address, caches);
        if (!caches[address]) return;
        --caches[address].listenerCount;
        const isDisposable = () => caches[address] && caches[address].listenerCount === 0;
        if (isDisposable()) {
            setTimeout(() => {
                if (isDisposable()) {
                    console.log(address, "dispose");
                    caches[address].offListener();
                    delete caches[address];
                }
            }, 1000);
        }
        console.log("b", caches);
    }
</script>

<script lang="ts">
    import { appContract } from "$/plugins/wallet";
    import { listenContract } from "$/plugins/wallet/listen";
    import { onDestroy } from "svelte";
    import { writable, Writable } from "svelte/store";

    export let address: string;
    let name: Writable<string> = null

    let addressCache = address;
    $: onAddressChange(address);

    function onAddressChange(newAddress: string) {
        if (newAddress) 
        {
            name = getName(newAddress);

        }
        else {
            dispose(addressCache);
            name = null;
        }
        addressCache = newAddress;
    }

    onDestroy(() => address && dispose(address));
</script>

<span title={$name?.trim() || "Anonymous"}>
    {$name?.trim() || "Anonymous"}
</span>
