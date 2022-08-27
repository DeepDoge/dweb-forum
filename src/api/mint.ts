import { createPromiseResultCacher, createTempStore } from "$/utils/common/store"
import { globalDialogManager } from "$lib/kicho-ui/components/KDialog.svelte"
import { globalEventNotificationManager } from "$lib/kicho-ui/components/KEventNotification.svelte"
import { globalTaskNotificationManager } from "$lib/kicho-ui/components/KTaskNotification.svelte"
import { wallet } from "../tools/wallet"
import { NULL_ADDREESS } from "../tools/wallet/common"
import { deployedContracts } from "../tools/wallet/deployed"
import type { PostId } from "./feed"

export async function mintPostNft(postId: PostId)
{
    try
    {
        if (await isPostNft(postId))
        {
            await globalDialogManager.alert("This post already minted as NFT.")
            return
        }
    } catch (error)
    {
        console.warn(error)
    }

    await globalTaskNotificationManager.append(wallet.service.contracts.postNftContract.mintPostNft(postId), "Waiting for user approval...")
    await globalTaskNotificationManager.append(new Promise<void>((resolve) =>
        wallet.service.contracts.postNftContract.once(wallet.service.contracts.postNftContract.filters.Transfer(NULL_ADDREESS, wallet.service.account, postId), () => resolve())
    ),
        "Minting Post as NFT..."
    )
    globalEventNotificationManager.append("Post Minted")
}

const isNftStore = createTempStore<{ value: boolean }>(`is-post-nft-${deployedContracts[wallet.service.provider.network.chainId]?.['PostNFT']}`, 100 * 60 * 5)
const isNftCache = createPromiseResultCacher()
export async function isPostNft(postId: PostId)
{
    return await isNftCache.cache(postId.toString(), async () =>
    {
        const key = postId._hex
        try
        {
            const cache = await isNftStore.get(key)
            if (cache) return cache.value

            const result = await wallet.service.contracts.postNftContract.ownerOf(postId) !== NULL_ADDREESS
            await isNftStore.put(key, { value: result })
            return result
        }
        catch (error)
        {
            await isNftStore.put(key, { value: false })
            return false
        }
    })

}