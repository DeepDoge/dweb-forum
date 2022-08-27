<script lang="ts">
    import { wallet } from "$/tools/wallet";
    import { ethers } from "ethers";

    let balance: string;

    updateBalance();
    async function updateBalance() {
        if (wallet.service.account && wallet.service.provider)
            balance = ethers.utils.formatEther(await wallet.service.provider.getBalance(wallet.service.account));
        else balance = null;
    }
</script>

{balance?.split(".")[0] ?? "..."}
