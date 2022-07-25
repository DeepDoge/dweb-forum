<script lang="ts">
    import { wallet } from "$/tools/wallet";
    import { ethers } from "ethers";

    let balance: string;

    updateBalance();
    async function updateBalance() {
        if (wallet.account && wallet.provider) balance = ethers.utils.formatEther(await wallet.provider.getBalance(wallet.account));
        else balance = null;
    }
</script>

{balance?.split(".")[0] ?? "..."}
