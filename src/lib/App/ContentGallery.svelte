<script lang="ts">
    import KOverlay from "$lib/kicho-ui/components/KOverlay.svelte";
    import ContentImage from "./ContentImage.svelte";

    export let items: ContentImage["$$prop_def"][];
    $: previewItems = items.slice(0, Math.min(4, items.length));

    let modalActive = false;
    let selectedItem = items[0];

    $: countText = items.length > previewItems.length ? `+${items.length - previewItems.length}` : null;

    function show(index: number) {
        selectedItem = items[index];
        modalActive = true;
    }
</script>

<div class="gallery" class:more={countText} style:--count-text="'{countText}'">
    <div class="preview">
        <div class="items">
            {#each previewItems as item, i}
                <div class="item" on:click={() => show(i)}>
                    <ContentImage hide cover {...item} />
                </div>
            {/each}
        </div>
    </div>
</div>

<KOverlay size="100%" bind:active={modalActive} align="stretch" justify="center">
    <div class="modal">
        <div class="selected">
            <ContentImage {...selectedItem} />
        </div>
        <div class="scroll">
        <div class="items">
            {#each items as item, i}
                <div class="item" on:click={() => show(i)}>
                    <ContentImage hide cover {...item} />
                </div>
            {/each}
        </div>
    </div>
    </div>
</KOverlay>

<style>
    .preview .items {
        width: min(100%, 30em);
        aspect-ratio: 16/9;

        display: grid;
        --gap: var(--k-padding);
        grid-template-columns: repeat(auto-fit, minmax(calc(50% - var(--gap)), 1fr));
        gap: var(--gap);
    }

    .preview .item {
        width: 100%;
        height: 100%; /* so it always fill the space even if the image is not loaded yet */

        border-radius: var(--k-border-radius);
        overflow: hidden;
    }

    .gallery.more .preview .item:last-of-type::after {
        content: var(--count-text);
        position: absolute;
        inset: 0;
        display: grid;
        place-content: center;
        font-size: var(--k-font-x-larger);
        background-color: rgba(0, 0, 0, 0.6);
        pointer-events: none;
    }

    .modal {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        grid-template-rows: 1fr 5em;
        grid-template-areas: 
            ". selected ."
            "items items items";
        gap: calc(var(--k-padding));

        pointer-events: none;
    }

    .modal > * {
        pointer-events: all;
    }

    .modal .selected {
        grid-area: selected;
    }

    .modal .scroll {
        display: grid;
        justify-content: center;
        grid-area: items;
        overflow-x: auto;
        overflow-y: hidden;
    }

    .modal .items {
        display: flex;
        justify-content: start;
        gap: calc(var(--k-padding));
    }

    .modal .item {
        display: inline-block;
        width: min(5em, calc(100vw / 2.5));
        flex-shrink: 0;
        height: 100%;
        display: grid;
        place-items: stretch;
    }
</style>
