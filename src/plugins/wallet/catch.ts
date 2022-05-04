export function catchContract(err: Error & Record<string, any>)
{
    console.error(err, JSON.stringify(err, null, '\t'))
    alert(err.data?.message ?? err.error?.message ?? err.reason ?? err.message)
}