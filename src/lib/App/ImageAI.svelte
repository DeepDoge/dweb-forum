<script lang="ts">
    import { classifyImage, Predictions } from "$/tools/classifyImage";
    import { promiseQueue } from "$/utils/common/promiseQueue";
    import KSpinner from "$lib/kicho-ui/components/KSpinner.svelte";

    export let src: string = null;
    export let alt: string = null;

    let predictions: Predictions = null;

    let loading = true;

    const classify = promiseQueue(async (value: EventTarget) => {
        predictions = await classifyImage(value as any);
    });

    $: blur = loading || (predictions?.topPrediction.className !== "Neutral" && predictions?.topPrediction.className !== "Drawing");
</script>

<div
    class="image-ai"
    class:blur
    title={predictions?.predictionsArray.map((prediction) => `${prediction.className} - ${(prediction.probability * 100).toFixed(0)}`).join("\n") ??
        ""}
>
    <img
        width="100%"
        height="100%"
        on:loadstart={() => (loading = true)}
        on:load={() => loading = false}
        on:load={(e) => classify(e.target)}
        {src}
        {alt}
        crossorigin="anonymous"
    />
    {#if loading}
        <div class="spinner">
            <KSpinner />
        </div>
    {/if}
</div>

<style>
    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        object-position: center;
        background-color: #000;
    }

    .spinner {
        position: absolute;
        inset: 0;
        display: grid;
        place-content: center;
    }

    .image-ai {
        overflow: hidden;
    }

    .blur img {
        filter: blur(.75em);
    }
</style>
