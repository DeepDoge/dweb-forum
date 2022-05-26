<script>
    import KBoxEffect from "$/lib/kicho-ui/components/effects/KBoxEffect.svelte";
    import { account } from "$/plugins/wallet";
    import AddressOf from "$lib/App/AddressOf.svelte";
    import Balance from "$lib/App/Balance.svelte";
    import ClaimedNameOf from "$lib/App/ClaimedNameOf.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
</script>

<header>
    <div class="account">
        <KBoxEffect color="gradient" border glow blur radius="tile" contentBorderDirection="horizontal">
            <div class="account-info">
                <span class="account-name"><ClaimedNameOf address={$account} /></span>
                <KButton text href="##claim-name" title="Claim name for: {$account}">
                    <div class="account-address">
                        <AddressOf address={$account} />
                    </div>
                </KButton>
                <span class="account-balance">Balance: <b><Balance /></b></span>
            </div>
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
        grid-template-columns: 1fr;
        align-items: stretch;
        gap: var(--k-padding);
        padding: var(--k-padding);
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
        display: grid;
    }
</style>
