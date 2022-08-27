<script lang="ts">
    import { classifyImage, Predictions } from "$/tools/classifyImage";
    import { promiseQueue } from "$/utils/common/promiseQueue";
    import KSpinner from "$lib/kicho-ui/components/KSpinner.svelte";

    export let src: string = null;
    export let alt: string = null;
    export let cover = false;
    export let hide = false;

    let predictions: Predictions = null;
    $: classify(src);
    const classify = promiseQueue(async (value: typeof src) => {
        try {
            processing = true;
            show = false;
            const image = new Image(720, 720);
            image.src = value;
            image.style.objectFit = "contain";
            image.crossOrigin = "anonymous";
            document.head.appendChild(image);
            await new Promise<void>((r, e) => {
                const controller = new AbortController();
                image.addEventListener("load", () => r(), { once: true, signal: controller.signal });
                image.addEventListener(
                    "error",
                    () => {
                        e();
                        controller.abort();
                    },
                    { once: true }
                );
            });
            predictions = await classifyImage(image);
            image.remove();
            processing = false;
        } catch {}
    });

    let imageLoading = true;
    let processing = true;
    $: loading = processing || imageLoading;
    let show = false;
    $: nsfw =
        predictions &&
        (["Porn", "Hentai", "Sexy"].some((name) => predictions.array[0].className === name) && predictions.map.Neutral.probability < 0.0299);
    $: blur = (hide || !show) && (loading || !predictions || nsfw);

    $: text = nsfw && blur ? "NSFW" : null;
</script>

<div
    on:click={() => (show = !show)}
    class="image-ai"
    class:cover
    class:blur
    title={predictions?.array.map((prediction) => `${prediction.className} - ${(prediction.probability * 100).toFixed(0)}%`).join("\n") ?? ""}
>
    <div class="image-wrapper">
        {#key src}
            <img on:loadstart={() => (imageLoading = true)} on:load={() => setTimeout(() => (imageLoading = false), 500)} {src} {alt} />
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
        cursor: pointer;
        background-color: transparent;
        overflow: hidden;
    }

    .image-wrapper {
        display: inline-block;
        overflow: hidden;
        height: 100%;
    }

    .image-wrapper {
        margin-left: 50%;
        transform: translate(-50%, 0);
    }

    img {
        width: auto;
        max-width: 95vw;
        height: 100%;
        object-fit: contain;
    }

    .cover .image-wrapper {
        display: grid;
        width: 100%;
        place-items: stretch;
    }

    .cover img {
        object-fit: cover;
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

    .text {
        background-color: rgba(255, 255, 255, 0.6);
        border-radius: var(--k-border-radius-rounded);
        padding: calc(var(--k-padding) * 2) calc(var(--k-padding) * 4);
        color: rgb(114, 114, 114);
        font-weight: bold;
        font-size: 47%;
    }
</style>
