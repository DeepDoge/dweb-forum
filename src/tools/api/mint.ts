import { postToNftContract, wallet } from "../wallet"
import type { PostId } from "./feed"
import { globalTaskNotificationManager } from "$lib/kicho-ui/components/KTaskNotification.svelte";
import { globalEventNotificationManager } from "$lib/kicho-ui/components/KEventNotification.svelte"
import { globalDialogManager } from "$lib/kicho-ui/components/KDialog.svelte"
import { get } from "svelte/store"

export async function mintPostNft(postId: PostId)
{
    try {
        const owner = await postToNftContract.ownerOf(postId)
        if (owner.toLowerCase() === wallet.account.toLowerCase())
            await globalDialogManager.alert("You already own this NFT.")
        else if (owner)
            await globalDialogManager.alert("This post already minted as NFT.")

        if (owner) return
    } catch (error) { }
    
    await globalTaskNotificationManager.append(postToNftContract.mintPostNft(postId), "Minting Post...")
    globalEventNotificationManager.append("Post Minted")
}