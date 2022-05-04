import type { Contract } from "ethers"

export function listenContract<C extends Contract>(contract: C, event: Parameters<typeof contract.on>[0], listener: Parameters<typeof contract.on>[1])
{
    contract.on(event, (...params: any) => { console.log(...params); listener(...params) })
    return () => contract.off(event, listener)
}