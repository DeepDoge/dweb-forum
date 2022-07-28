<script lang="ts">
    import { classifyImage, Predictions } from "$/tools/classifyImage";
    import { promiseQueue } from "$/utils/common/promiseQueue";
    import KSpinner from "$lib/kicho-ui/components/KSpinner.svelte";

    export let src: string = null;
    export let alt: string = null;

    let predictions: Predictions = null;
    const classify = promiseQueue(async (value: EventTarget) => {
        predictions = await classifyImage(value as any);
    });


    let loading = true;
    let show = false;
    $: blur = !show && (loading || (predictions?.topPrediction.className !== "Neutral" && predictions?.topPrediction.className !== "Drawing"));
</script>

<div
    on:click={() => (show = !show)}
    class="image-ai"
    class:blur
    title={predictions?.predictionsArray.map((prediction) => `${prediction.className} - ${(prediction.probability * 100).toFixed(0)}%`).join("\n") ??
        ""}
>
    <img
        width="100%"
        height="100%"
        on:loadstart={() => {loading = true; show = false}}
        on:load={() => (loading = false)}
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
        cursor: pointer;
    }

    .blur img {
        filter: blur(0.75em);
    }
</style>
