import { globalDialogManager } from "$lib/kicho-ui/components/KDialog.svelte"
import { globalEventNotificationManager } from "$lib/kicho-ui/components/KEventNotification.svelte"
import { globalTaskNotificationManager } from "$lib/kicho-ui/components/KTaskNotification.svelte"
import { BigNumber } from "ethers"
import { NULL_ADDREESS, postNftContract, wallet } from "../wallet"
import { waitContractUntil } from "../wallet/listen"
import type { PostId } from "./feed"

export async function mintPostNft(postId: PostId)
{
    try
    {
        const owner = await postNftContract.ownerOf(postId)
        if (owner.toLowerCase() === wallet.account.toLowerCase())
            await globalDialogManager.alert("You already own this NFT.")
        else if (owner)
            await globalDialogManager.alert("This post already minted as NFT.")

        if (owner) return
    } catch (error)
    {
        console.warn(error)
    }

    await globalTaskNotificationManager.append(postNftContract.mintPostNft(postId), "Waiting for user approval...")
    await globalTaskNotificationManager.append(
        waitContractUntil(
            postNftContract, 
            postNftContract.filters.Transfer(NULL_ADDREESS, wallet.account, postId), 
            () => true
        ), 
        "Minting Post as NFT..."
    )
    globalEventNotificationManager.append("Post Minted")
}