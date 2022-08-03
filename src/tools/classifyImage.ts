import { createPromiseResultCacher, createTempStore } from "$/utils/common/store"

declare module nsfwjs
{
    interface Model
    {
        classify(img: HTMLImageElement): Promise<Prediction[]>
    }

    interface Prediction
    {
        className: 'Neutral' | 'Sexy' | 'Drawing' | 'Porn' | 'Hentai',
        probability: number
    }


    export function load(): Promise<Model>
}

export interface Predictions
{
    map: Record<nsfwjs.Prediction['className'], nsfwjs.Prediction>
    array: nsfwjs.Prediction[]
}

const nsfwModelPromise = (async () =>
{
    while (true)
    {
        try
        {
            return await nsfwjs.load()
        } catch (error)
        {
            await new Promise((r) => setTimeout(r, 1500))
        }
    }
})()

const imageClassCache = createPromiseResultCacher()
const imageClassStore = createTempStore<nsfwjs.Prediction[]>('image-class')
export async function classifyImage(img: HTMLImageElement): Promise<Predictions>
{
    return await imageClassCache.cache(img.src, async () =>
    {
        function toMap(predictions: nsfwjs.Prediction[])
        {
            return Object.fromEntries(predictions.map((prediction) => [prediction.className, prediction])) as any
        }

        const cache = await imageClassStore.get(img.src)
        if (cache) return {
            map: toMap(cache),
            array: cache
        }

        const nsfwModel = await nsfwModelPromise
        const predictions = await nsfwModel.classify(img)

        const value: Predictions = {
            map: toMap(predictions),
            array: predictions
        }

        await imageClassStore.put(img.src, value.array)

        return value 
    })
}
