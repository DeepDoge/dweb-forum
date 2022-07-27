import { currentChainOption } from "$/tools/wallet"
import { goto } from "$app/navigation"
import { get, readable } from "svelte/store"

window.addEventListener("hashchange", () => goto(location.href))
const pushState = history.pushState
history.pushState = function (...params)
{
    if (params[2].toString() === location.href) return
    pushState.call(history, ...params)
}

export interface Route
{
    chainId: number
    path: string
    pathArr: string[]
    hash: string
}

function parseURL(url: URL): Route
{
    const hashValue = decodeURIComponent(url.hash.substring(1))

    const parts = hashValue.split("#")
    const chainId = parts[0] && /^[0-9]+$/.test(parts[0]) ? parseInt(parts[0]) : null
    const path = parts[1] ?? ""
    const hash = parts[2] ?? ""

    return { chainId, path, hash, pathArr: path.split('/') }
}

let cacheHref = null
export const currentRoute = readable<Route>(parseURL(new URL(location.href)), (set) => 
    window.addEventListener("hashchange", () => 
    {
        if (cacheHref === location.href) return
        cacheHref = location.href
        const cache = get(currentRoute)
        const value = parseURL(new URL(location.href))
        console.log(value)
        set(value)
        if (cache.chainId !== value.chainId) location.reload()
    }))