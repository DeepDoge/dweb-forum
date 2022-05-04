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
            <a href="#/$/claim-name" alt={null} class="account-address" title="Claim name for: {$account}">
                {$account.substring(0, 10)}...{$account.slice(-5)}
            </a>

            <div class="account-balance">Balance: <b><Balance /></b></div>
        </div>

        <div class="publish-button" title="Publish new content">
            <KButton on:click={() => (location.hash = "#/$/publish")}>+</KButton>
        </div>
    </div>
</header>

<style>
    .publish-button {
        font-size: 2em;
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

    .account-info > * {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>
