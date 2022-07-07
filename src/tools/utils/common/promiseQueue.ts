
let counter = 0
export function promiseQueue<F extends (...params: any) => Promise<any>>(func: F)
{
    const id = counter++
    const queue: QueueItem[] = []


    interface QueueItem
    {
        id: number
        promise: R
    }

    type P = Parameters<F>
    type R = ReturnType<F>

    function call(...params: P): R
    {
        return (async () =>
        {
            queue.push({ id, promise: null })


            while (queue.length > 0)
            {
                if (queue[0].promise) await queue[0].promise
                if (queue[0].id === id)
                {
                    try 
                    {
                        const r = await (queue[0].promise = func(...(params as any)) as any)
                        queue.shift()
                        return r
                    }
                    catch (err)
                    {
                        queue.shift()
                        throw err
                    }
                }
                await new Promise((r) => setTimeout(r))
            }
        })() as any
    }

    return { call }
}