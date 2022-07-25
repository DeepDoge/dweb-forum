<script lang="ts">
import { wallet } from "$/tools/wallet";

    import { ethers } from "ethers";

    let balance: string;

    async function updateBalance(address: string) {
        if (address && wallet.provider) balance = ethers.utils.formatEther(await wallet.provider.getBalance(address));
        else balance = null;
    }

    $: updateBalance(wallet.account);
</script>

{balance?.split(".")[0] ?? "..."}
