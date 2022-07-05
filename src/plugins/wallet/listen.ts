import type { Contract } from "ethers";

export function listenContract<C extends Contract>(contract: C, event: Parameters<typeof contract.on>[0], listener: Parameters<typeof contract.on>[1])
{
    let off: () => void = null
    contract.on(event, (...params: any) => { listener(...params) })
    off = () => contract.off(event, listener)
    return () => off()
}

export async function waitContractUntil<C extends Contract>(
    contract: C,
    event: Parameters<typeof contract.on>[0],
    until: (...args: Parameters<Parameters<typeof contract.on>[1]>) => boolean)
{
    return await new Promise<void>((resolve) =>
    {
        const off = listenContract(contract, event, (...args) =>
        {
            if (until(...args))
            {
                off()
                resolve()
            }
        })
    })
}