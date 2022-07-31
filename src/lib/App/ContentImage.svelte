<script lang="ts">
    import { classifyImage, Predictions } from "$/tools/classifyImage";
    import { promiseQueue } from "$/utils/common/promiseQueue";
    import KSpinner from "$lib/kicho-ui/components/KSpinner.svelte";

    export let src: string = null;
    export let alt: string = null;
    export let fit: "contain" | "cover" = "contain";
    export let hide = false;

    let predictions: Predictions = null;
    $: classify(src);
    const classify = promiseQueue(async (value: typeof src) => {
        processing = true;
        show = false;
        const image = new Image(720, 720);
        image.src = value;
        image.style.objectFit = "contain";
        image.crossOrigin = "anonymous";
        document.head.appendChild(image);
        await new Promise((r) => image.addEventListener("load", r, { once: true }));
        predictions = await classifyImage(image);
        image.remove();
        processing = false;
    });

    let imageLoading = true;
    let processing = true;
    $: loading = processing || imageLoading;
    let show = false;
    $: nsfw =
        predictions &&
        predictions.predictions.Neutral.probability < 0.07 &&
        (predictions.predictions.Porn.probability >= 0.6 ||
            predictions.predictions.Sexy.probability >= 0.75 ||
            predictions.predictions.Hentai.probability >= 0.6 ||
            predictions.predictions.Porn.probability + predictions.predictions.Sexy.probability + predictions.predictions.Hentai.probability >= 0.8);
    $: blur = (hide || !show) && (loading || !predictions || nsfw);

    $: text = nsfw && blur ? "NSFW" : null;
</script>

<div
    on:click={() => (show = !show)}
    class="image-ai"
    class:blur
    title={predictions?.predictionsArray.map((prediction) => `${prediction.className} - ${(prediction.probability * 100).toFixed(0)}%`).join("\n") ??
        ""}
>
    <div class="image-wrapper">
        {#key src}
            <img
                on:loadstart={() => (imageLoading = true)}
                on:load={() => setTimeout(() => (imageLoading = false), 500)}
                style:--fit={fit}
                {src}
                {alt}
            />
        {/key}
    </div>
    <div class="overlay">
        {#if loading}
            <KSpinner />
        {:else if text}
            <div class="text">
                {text}
            </div>
        {/if}
    </div>
</div>

<style>
    .image-ai {
        width: 100%;
        height: 100%;
        display: grid;
        place-items: stretch;
        cursor: pointer;
    }

    .image-wrapper {
        width: 100%;
        height: 100%;
        background-color: #000;
        overflow: hidden;
    }

    .text {
        background-color: rgba(255, 255, 255, 0.6);
        border-radius: var(--k-border-radius-rounded);
        padding: calc(var(--k-padding) * 2) calc(var(--k-padding) * 4);
        color: rgb(114, 114, 114);
        font-weight: bold;
        font-size: 47%;
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: var(--fit);
        object-position: center;
    }

    .blur img {
        filter: blur(0.75rem);
    }

    .overlay {
        position: absolute;
        inset: 0;
        display: grid;
        place-content: center;
        pointer-events: none;
    }
</style>
