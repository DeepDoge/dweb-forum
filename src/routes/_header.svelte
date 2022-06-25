<script lang="ts">
    import KBoxEffect from "$/lib/kicho-ui/components/effects/KBoxEffect.svelte";
    import { isValidAddress } from "$/plugins/common/isValidAddress";
    import { account } from "$/plugins/wallet";
    import AddressOf from "$lib/App/AddressOf.svelte";
    import AvatarOf from "$lib/App/AvatarOf.svelte";
    import NicknameOf from "$lib/App/NicknameOf.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import { route } from "./_routing.svelte";
</script>

<header>
    <KBoxEffect color="mode" blur size="smaller" background radius="tile">
        <div class="account-info">
            <div class="avatar">
                <AvatarOf address={$account} />
            </div>
            <div class="nickname"><NicknameOf address={$account} /></div>
            <div class="address">
                <KButton text href="#{$route.route}#claim-name" title="Claim name for: {$account}">
                    <div>
                        <AddressOf address={$account} />
                    </div>
                </KButton>
            </div>
        </div>
        <KButton radius="fab" color="gradient" href="#">Home</KButton>
        <!-- <div class="account-balance k-text-singleline">Balance: <b><Balance /></b></div> -->
    </KBoxEffect>
</header>

<style>
    header {
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        justify-content: space-between;
        justify-items: start;
        padding: calc(var(--k-padding) * 2);
        gap: calc(var(--k-padding) * 2);
    }

    .account-info {
        display: grid;
        justify-items: start;
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
