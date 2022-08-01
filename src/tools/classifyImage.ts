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
    predictions: Record<nsfwjs.Prediction['className'], nsfwjs.Prediction>
    predictionsArray: nsfwjs.Prediction[]
}

const nsfwModelPromise = (async () => {
    while (true)
    {
        try {
            return await nsfwjs.load()
        } catch (error) {
            await new Promise((r) => setTimeout(r, 1500))
        }
    }
})() 

export async function classifyImage(img: HTMLImageElement): Promise<Predictions>
{
    const nsfwModel = await nsfwModelPromise
    const predictions = await nsfwModel.classify(img)

    return {
        predictions: Object.fromEntries(predictions.map((prediction) => [prediction.className, prediction])) as any,
        predictionsArray: predictions
    }
}