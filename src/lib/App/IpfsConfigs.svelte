<script lang="ts">
import { ipfs } from "$/tools/ipfs";

    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import KTextField from "$lib/kicho-ui/components/KTextField.svelte";
    import { get } from "svelte/store";

    let localIpfsConfig = get(ipfs.configs)[0];
    let remoteIpfsConfig = get(ipfs.configs)[1];
    function update() {
        localIpfsConfig = get(ipfs.configs)[0];
        remoteIpfsConfig = get(ipfs.configs)[1];
    }

    function save() {
        ipfs.configs.set([localIpfsConfig, remoteIpfsConfig]);
        update();
    }

    function reset() {
        ipfs.configs.set(ipfs.defaultConfigs());
        update();
    }
</script>

<form class="ipfs-configs" on:submit|preventDefault={save}>
    <div class="config">
        <div class="label">Local</div>
        <KTextField label="Gateway" bind:value={localIpfsConfig.gateway} />
        <KTextField label="API" bind:value={localIpfsConfig.api} />
    </div>

    <div class="config">
        <div class="label">Remote Fallback</div>
        <KTextField label="Gateway" bind:value={remoteIpfsConfig.gateway} />
        <KTextField label="API" bind:value={remoteIpfsConfig.api} />
    </div>

    <div class="actions">
        <input type="submit" style="opacity:0;position:absolute;pointer-events:none;width:0;height:0" />
        <KButton href="javascript:/*reset*/;" on:click={reset}>Reset</KButton>
        <KButton color="master">Save</KButton>
    </div>
</form>

<style>
    .ipfs-configs {
        display: grid;
        gap: calc(var(--k-padding) * 2);
    }

    .config {
        background-color: var(--k-color-mode);
        padding: calc(var(--k-padding) * 3.5);
        border-radius: var(--k-border-radius);
    }

    .label {
        font-weight: bold;
        padding-bottom: var(--k-padding);
    }

    .actions {
        display: grid;
        grid-auto-flow: column;
        gap: var(--k-padding);
    }
</style>
