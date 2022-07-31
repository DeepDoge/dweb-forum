<script lang="ts">
    import KBoxEffect from "$/lib/kicho-ui/components/effects/KBoxEffect.svelte";
    import { connectWallet, wallet } from "$/tools/wallet";
    import AddressOf from "$lib/App/AddressOf.svelte";
    import AvatarOf from "$lib/App/AvatarOf.svelte";
    import NicknameOf from "$lib/App/NicknameOf.svelte";
    import Notifications from "$lib/App/Notifications.svelte";
    import ChainPicker from "$lib/App/ChainPicker.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import { currentRoute } from "./_routing";

    let height: number = 0;

    $: document.body.style.setProperty("--header-height", `${height}px`);
</script>

<header style:--height={height} bind:offsetHeight={height}>
    <KBoxEffect color="mode" blur size="smaller" background radius="tile">
        {#if wallet.account}
            <div class="account-info">
                <div class="avatar">
                    <AvatarOf address={wallet.account} />
                </div>
                <div class="nickname">
                    <KButton text href="#{$currentRoute.chainId}#{$currentRoute.path}#claim-name" title="Claim Nickname">
                        <NicknameOf address={wallet.account} />
                    </KButton>
                </div>
                <div class="address">
                    <AddressOf address={wallet.account} />
                </div>
            </div>
        {:else}
            <KButton color="gradient" glow="gradient" glowMultiplier={0.5} on:click={() => connectWallet()}>Connect Wallet</KButton>
        {/if}
        <ChainPicker />
        {#if wallet.account}
            <Notifications account={wallet.account} />
        {/if}
        <KButton radius="fab" color={$currentRoute.path || $currentRoute.hash ? "mode-pop" : "master"} href="#{$currentRoute.chainId}#">Home</KButton>
        <!-- <div class="account-balance k-text-singleline">Balance: <b><Balance /></b></div> -->
    </KBoxEffect>
</header>

<style>
    header {
        display: grid;
        grid-template-columns: 1fr auto auto auto;
        align-items: center;
        justify-content: space-between;
        justify-items: start;
        padding: calc(var(--k-padding) * 2);
        gap: calc(var(--k-padding) * 2);
        position: sticky;
        top: 0;
        z-index: var(--k-z-index-floating);
    }

    .account-info {
        display: grid;
        align-items: center;
        grid-template-columns: 2.5em 1fr;
        grid-template-areas:
            "avatar nickname"
            "avatar address";
        gap: calc(var(--k-padding) * 1);
    }

    .avatar {
        grid-area: avatar;
    }

    .nickname {
        grid-area: nickname;
    }

    .address {
        grid-area: address;
        max-width: 12em;
    }
</style>
