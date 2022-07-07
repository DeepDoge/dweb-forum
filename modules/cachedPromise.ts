const FinalizationRegistry = (window as any).FinalizationRegistry

export function cachedPromise<P extends Record<string, any>, R extends object>(keyGetter: (params: P) => string, func: (params: P) => Promise<R>)
{
    // Using WeakSet instead of WeakRef because WeakRef doesn't have full browser support yet.
    const caches: Record<string, WeakSet<R>> = {}
    const finalizer = new FinalizationRegistry((key: string) =>
    {
        console.log(`Finalizing cached promise: ${key}`)
        delete caches[key]
    })
    const onGoingTasks: Record<string, Promise<R>> = {}
    async function task(params: P): Promise<R>
    {
        const key = keyGetter(params)
        const cache = caches[key][0]
        if (cache) return cache

        const onGoing = onGoingTasks[key]
        if (onGoing) return await onGoing

        const result = await (onGoingTasks[key] = func(params))
        caches[key] = new WeakSet([result])
        finalizer.register(result, key)
        delete onGoingTasks[key]

        return result
    }

    const taskWithInternalAccess: typeof task &
    {
        _getCache(key: string): R
        _setCache(key: string, value: R): void
    } = task as any
    taskWithInternalAccess._getCache = (key) => caches[key][0]
    taskWithInternalAccess._setCache = (key, value) => caches[key] = new WeakSet([value])
    return taskWithInternalAccess
}
