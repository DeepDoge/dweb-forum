import { globalDialogManager } from "$lib/kicho-ui/dialog"

export function catchContract(err: Error & Record<string, any>)
{
    console.error(err, JSON.stringify(err, null, '\t'))
    globalDialogManager.alert(err.data?.message ?? err.error?.message ?? err.reason ?? err.message ?? "Something went wrong.")
}