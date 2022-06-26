
export function cachedPromise<P extends Record<string, any>, R>(keyGetter: (params: P) => string, func: (params: P) => Promise<R>)
{
    const keys: Record<string, object> = {}
    const caches: WeakMap<object, R> = new WeakMap()
    const onGoingTasks: Record<string, Promise<R>> = {}
    async function task(params: P): Promise<R>
    {
        const stringKey = keyGetter(params)
        const key = keys[stringKey] ?? (keys[stringKey] = {})

        const cache = caches.get(key)
        if (cache) return cache

        const onGoing = onGoingTasks[stringKey]
        if (onGoing) 
        {
            const result = await onGoing
            if (onGoingTasks[stringKey]) delete onGoingTasks[stringKey]
            return result
        }

        console.log('caching new value', stringKey)
        const result = await (onGoingTasks[stringKey] = func(params))
        caches.set(key, result)
        return result
    }

    const taskWithInternalAccess: typeof task & 
    { 
        _getCache(key: string): R
        _setCache(key: string, value: R): void
    } = task as any
    taskWithInternalAccess._getCache = (key) => caches.get(keys[key] ?? (keys[key] = {}))
    taskWithInternalAccess._setCache = (key, value) => caches.set(keys[key] ?? (keys[key] = {}), value)
    return taskWithInternalAccess
}
