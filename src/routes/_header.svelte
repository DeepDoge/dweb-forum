<script lang="ts">
    import KBoxEffect from "$/lib/kicho-ui/components/effects/KBoxEffect.svelte";
    import { isValidAddress } from "$/plugins/common/isValidAddress";
    import { account } from "$/plugins/wallet";
    import AddressOf from "$lib/App/AddressOf.svelte";
    import AvatarOf from "$lib/App/AvatarOf.svelte";
    import Balance from "$lib/App/Balance.svelte";
    import NicknameOf from "$lib/App/NicknameOf.svelte";
    import ProfileMiniCard from "$lib/App/ProfileMiniCard.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import KTextField from "$lib/kicho-ui/components/KTextField.svelte";
    import { BigNumber } from "ethers";

    let searchInput: string;
    async function search() {
        if (/^\d+$/.test(searchInput)) location.hash = `##post:${BigNumber.from(searchInput)}`;
        if (searchInput.startsWith("#")) location.hash = searchInput;
        if (isValidAddress(searchInput)) location.hash = `#${searchInput}`;
    }
</script>

<header>
    <KBoxEffect color="mode" blur size="smaller" background radius="tile">
        <div class="account-info">
            <div class="avatar">
                <AvatarOf address={$account} />
            </div>
            <div class="nickname"><NicknameOf address={$account} /></div>
            <div class="address">
                <KButton text href="##claim-name" title="Claim name for: {$account}">
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
        position: sticky;
        top: 0;
        z-index: 1;
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
