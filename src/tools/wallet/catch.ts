import { globalDialogManager } from "$lib/kicho-ui/components/KDialog.svelte"

export async function catchContract(err: Error & Record<string, any>)
{
    console.error(err, JSON.stringify(err, null, '\t'))
    await globalDialogManager.alert(err.data?.message ?? err.error?.message ?? err.reason ?? err.message ?? "Something went wrong.")
}