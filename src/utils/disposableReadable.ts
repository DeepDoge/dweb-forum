import { get, type Readable } from "svelte/store"

export function disposableReadable<T>(params: {
    active: Readable<boolean>
    value: Readable<T>
    init: (value: T) => void
    dispose: (value: T) => void
})
{
    let current = false
    let cache: T = null
 
    function init(value: T)
    {
        if (current === true) return
        current = true
        return params.init(value)
    }

    function dispose(value: T)
    {
        if (current === false) return
        current = false
        return params.dispose(value)
    }
    
    params.value.subscribe((value) =>
    {
        if (!get(params.active)) return
        if (cache) dispose(cache)
        init(value)
        cache = value
    })

    params.active.subscribe((active) =>
    {
        const value = get(params.value)
        if (!value) return
        if (active) init(value)
        else dispose(value)
    })
}