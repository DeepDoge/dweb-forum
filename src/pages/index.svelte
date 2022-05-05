<script>
    import KBoxEffect from "$/lib/kicho-ui/components/effects/KBoxEffect.svelte";
</script>

<div id="page">
    <div class="test">
        <KBoxEffect radius="rounded" background blur glow="border" border color="gradient" ripple size="xx-larger">
            <div>Test</div>
        </KBoxEffect>
    </div>
    <div class="test">
        <KBoxEffect radius="rounded" background blur glow="border" border color="gradient" ripple size="xx-larger">
            <div>Test</div>
            <div>Test</div>
        </KBoxEffect>
    </div>
    <div class="test">
        <KBoxEffect>
            <div>Test</div>
        </KBoxEffect>
    </div>
    <div class="test">
        <div>Test</div>
    </div>
</div>

<style>
    #page {
        display: grid;
        grid-auto-flow: row;
        grid-template-columns: 1fr;
        gap: 0.5em;

        justify-content: center;
        grid-template-columns: min(30em, 100%);
        padding: 5em;
    }

    .test {
        padding: calc(var(--k-padding) * 2);
    }
</style>
