<script>
    import { account } from "$/plugins/wallet";
    import Balance from "$lib/App/Balance.svelte";
    import ClaimedNameOf from "$lib/App/ClaimedNameOf.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
</script>

<header>
    <div class="account">
        <div class="account-info">
            <span class="account-name"><ClaimedNameOf address={$account} /></span>
            <KButton type="text" href="#/$/claim-name" title="Claim name for: {$account}">
                {$account.substring(0, 16)}...{$account.slice(-8)}
            </KButton>
            <div class="account-balance">Balance: <b><Balance /></b></div>
        </div>

        <KButton type="text" size="x-larger" title="Publish new content" on:click={() => (location.hash = "#/$/publish")}>+</KButton>
    </div>
</header>

<style>
    header {
        display: grid;
        justify-content: start;
        grid-template-columns: min(30em, 100%);
    }

    .account {
        display: grid;
        grid-auto-flow: column;
        justify-content: start;
        align-items: center;
        width: auto;
        gap: 0.5em;
        max-width: 100%;
    }

    .account::before {
        content: "";
        width: 0.5em;
        height: 75%;
        aspect-ratio: 1/1;
        background: var(--k-color-gradient);
        background-position: center;
        background-size: 500%;
        overflow: hidden;
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
</style>
