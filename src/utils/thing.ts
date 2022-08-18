export function createTheThingThatLetsYouInitializeAndFinalize_A_ValueWhenItsSetAndSomeBooelanIsTrue<T>(params: {
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

    function update(active: boolean, value: T)
    {
        if (cache) dispose(cache)
        if (active && value)
        { 
            init(value)
            cache = value
        }
    }

    return {
        update
    }
}