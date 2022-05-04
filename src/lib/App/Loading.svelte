<script lang="ts">
    export let size: string = "4em";
</script>

<div class="loading" style="--size:{size}">
    <div />
    <div />
    <div />
    <div />
</div>

<style>
    .loading {
        --blob-size: calc(var(--size) / 2);
        --dist-x: calc(var(--blob-size) / 2);
        --dist-y: var(--dist-x);
        position: relative;
        width: calc(var(--blob-size) * 2);
        aspect-ratio: 1/1;
        align-self: center;
        justify-self: center;
        margin: auto;
    }

    .loading > * {
        width: var(--blob-size);
        position: absolute;
        margin-left: 25%;
        margin-top: 25%;
        aspect-ratio: 1/1;
        background-color: var(--k-color-master);
        border-radius: 1000%;
        animation: blob-left-top-anim cubic-bezier(0.77, 0, 0.175, 1) 2s infinite;
    }

    .loading > *:nth-child(2) {
        animation-name: blob-right-top-anim;
    }
    .loading > *:nth-child(3) {
        animation-name: blob-left-bottom-anim;
    }
    .loading > *:nth-child(4) {
        animation-name: blob-right-bottom-anim;
    }

    @keyframes blob-left-top-anim {
        0% {
            transform: scale(1.1) translate(0, 0);
        }
        33% {
            transform: scale(0.9) translate(calc(-1 * var(--dist-x)), 0);
        }
        62% {
            transform: scale(0.7) translate(calc(-1 * var(--dist-x)), calc(-1 * var(--dist-y)));
        }
        94% {
            transform: scale(1.1) translate(0, 0);
        }
    }

    @keyframes blob-right-top-anim {
        0% {
            transform: scale(1.1) translate(0, 0);
        }
        33% {
            transform: scale(0.9) translate(var(--dist-x), 0);
        }
        64% {
            transform: scale(0.7) translate(var(--dist-x), calc(-1 * var(--dist-y)));
        }
        96% {
            transform: scale(1.1) translate(0, 0);
        }
    }
    @keyframes blob-left-bottom-anim {
        0% {
            transform: scale(1.1) translate(0, 0);
        }
        33% {
            transform: scale(0.9) translate(calc(-1 * var(--dist-x)), 0);
        }
        66% {
            transform: scale(0.7) translate(calc(-1 * var(--dist-x)), var(--dist-y));
        }
        98% {
            transform: scale(1.1) translate(0, 0);
        }
    }

    @keyframes blob-right-bottom-anim {
        0% {
            transform: scale(1.1) translate(0, 0);
        }
        33% {
            transform: scale(0.9) translate(var(--dist-x), 0);
        }
        68% {
            transform: scale(0.7) translate(var(--dist-x), var(--dist-y));
        }
        100% {
            transform: scale(1.1) translate(0, 0);
        }
    }
</style>
