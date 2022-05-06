<script>
    import KBoxEffect from "$/lib/kicho-ui/components/effects/KBoxEffect.svelte";
</script>

<div id="page">
    <div class="test">
        <KBoxEffect radius="rounded" background blur glow border color="gradient" ripple size="xx-larger">
            <div>Test</div>
        </KBoxEffect>
    </div>
    <div class="test">
        <KBoxEffect radius="normal" background blur glow border color="gradient" ripple size="xx-larger">
            <div>Test</div>
        </KBoxEffect>
    </div>
    <div class="test">
        <KBoxEffect size="xx-larger" glow border ripple radius="rounded">
            <div>Test</div>
        </KBoxEffect>
    </div>
    <div class="test">
        <KBoxEffect size="xx-larger" glow background ripple radius="rounded">
            <div>Test</div>
        </KBoxEffect>
    </div>
    <div class="test">
        <KBoxEffect size="xx-larger" glow color="master" ripple background radius="rounded">
            <div>Test</div>
        </KBoxEffect>
    </div>
    <div class="test">
        <KBoxEffect size="xx-larger" glow color="slave" ripple background radius="tile">
            <div>Test</div>
        </KBoxEffect>
    </div>
</div>

<style>
    .test div {
        padding: var(--k-padding);
    }
    #page {
        display: grid;
        grid-auto-flow: row;
        grid-template-columns: 1fr;
        gap: 0.5em;

        justify-content: center;
        grid-template-columns: min(30em, 100%);
        padding: 5em;
    }
</style>
