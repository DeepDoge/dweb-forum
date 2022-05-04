<script lang="ts">
    import { account, provider } from "$/plugins/wallet";
    import { ethers } from "ethers";

    let balance: string;

    async function updateBalance(address: string) {
        if (address && $provider) balance = ethers.utils.formatEther(await $provider.getBalance(address));
        else balance = null;
    }

    $: updateBalance($account);
</script>

{balance ?? "..."}
