<script>
    import KBoxEffect from "$/lib/kicho-ui/components/effects/KBoxEffect.svelte";
    import { account } from "$/plugins/wallet";
    import Balance from "$lib/App/Balance.svelte";
    import ClaimedNameOf from "$lib/App/ClaimedNameOf.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
</script>

<header>
    <div class="account">
        <KBoxEffect color="gradient" border glow blur radius="tile">
            <div class="account-info">
                <span class="account-name"><ClaimedNameOf address={$account} /></span>
                <KButton text href="#/$/claim-name" title="Claim name for: {$account}">
                    <span class="account-address" data-start={$account.substring(0, 39)} data-end={$account.substring(39)} />
                </KButton>
                <div class="account-balance">Balance: <b><Balance /></b></div>
            </div>
            <KButton text size="x-larger" title="Publish new content" on:click={() => (location.hash = "#/$/publish")}>+</KButton>
        </KBoxEffect>
    </div>
</header>

<style>
    header {
        display: grid;
        grid-template-columns: min(22em, 100%);
    }

    .account {
        display: grid;
        grid-auto-flow: column;
        grid-template-columns: 1fr 4em;
        align-items: stretch;
        gap: var(--k-padding);
        max-width: 100%;
    }

    .account-info {
        display: grid;
        justify-items: start;
        grid-template-columns: 1fr;
    }

    .account-info > :global(*) {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .account-address {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: flex-start;
    }

    .account-address::before {
        content: attr(data-start);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex-shrink: 1;
    }

    .account-address::after {
        content: attr(data-end);
        white-space: nowrap;
        flex-basis: content;
        flex-grow: 0;
        flex-shrink: 0;
    }
</style>
