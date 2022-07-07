const FinalizationRegistry = (window as any).FinalizationRegistry

export function cachedPromise<P extends Record<string, any>, R extends object>(keyGetter: (params: P) => string, promise: (params: P) => Promise<R>)
{
    // Using WeakSet instead of WeakRef because WeakRef doesn't have full browser support yet.
    const caches: Record<string, WeakSet<R>> = {}
    const finalizer = new FinalizationRegistry((key: string) =>
    {
        console.log(`Finalizing cached promise: ${key}`)
        delete caches[key]
    })
    function setCache(key: string, value: R)
    {
        const cache = getCache(key)
        if (cache) 
        {
            if (cache === value) return
            finalizer.unregister(cache)
        }
        caches[key] = new WeakSet([value])
        finalizer.register(value, key)
    }
    function getCache(key: string)
    {
        return caches[key]?.[0]
    }

    const onGoingTasks: Record<string, Promise<R>> = {}
    async function task(params: P): Promise<R>
    {
        const key = keyGetter(params)
        const cache = getCache(key)
        if (cache) return cache

        const onGoing = onGoingTasks[key]
        if (onGoing) return await onGoing

        const result = await (onGoingTasks[key] = promise(params))
        setCache(key, result)
        delete onGoingTasks[key]

        return result
    }

    const taskWithInternalAccess: typeof task &
    {
        _getCache(key: string): R
        _setCache(key: string, value: R): void
    } = task as any
    taskWithInternalAccess._getCache = (key) => getCache(key)
    taskWithInternalAccess._setCache = (key, value) => setCache(key, value)
    return taskWithInternalAccess
}
