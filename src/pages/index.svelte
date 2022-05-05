<script>
    import KTest from "$lib/kicho-ui/components/effects/KTest.svelte";
</script>

<div id="page">
    <div class="test">
        <KTest radius="rounded" blur glow="border" border color="gradient" ripple size="xx-larger">
            <div>
                Test
            </div>
        </KTest>
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
