<script>
import { account } from "$/plugins/wallet";

import Balance from "$lib/App/Balance.svelte";
import ClaimedNameOf from "$lib/App/ClaimedNameOf.svelte";

import ClaimName from "$lib/App/ClaimName.svelte";


import PublishPost from "$lib/App/PublishPost.svelte";
import KButton from "$lib/kicho-ui/components/KButton.svelte";
import KImage from "$lib/kicho-ui/components/KImage.svelte";
import KModal from "$lib/kicho-ui/components/KModal.svelte";

</script>
<header>
    <div class="account">
        <div class="account-avatar">
            <KImage src={null} alt="Account Avatar" />
        </div>

        <div class="account-info">
            <span class="account-name"><ClaimedNameOf address={$account} /></span>
            <a href="#/$/claim-name" alt={null} class="account-address" title="Claim name for: {$account}">
                {$account.substring(0, 10)}...{$account.slice(-5)}
            </a>
            
            <div class="account-balance">Balance: <b><Balance /></b></div>
        </div>

        <div class="publish-button" title="Publish new content">
            <KButton on:click={() => location.hash = '#/$/publish'}>+</KButton>
            
        </div>
    </div>
</header>

<style>
    .publish-button {
        font-size: 2em;
    }

    .account {
        display: inline-flex;
        align-items: center;
        width: auto;
        gap: 0.5em;
        max-width: 100%;
    }

    .account-avatar {
        width: 10em;
        aspect-ratio: 1/1;
        background: var(--k-color-gradient);
        border-radius: 100%;
        overflow: hidden;
    }

    .account-info > * {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>
