<script lang="ts">
    export let address: string;
</script>

<div aria-label={address} title={address} class="address k-text-singleline" data-start={address?.substring(0, 39)} data-end={address?.substring(39)} />

<style>
    .address {
        display: inline-grid;
        grid-template-columns: auto auto;
        justify-content: start;
    }

    .address::before {
        content: attr(data-start);
        min-width: 3.5em;
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .address::after {
        content: attr(data-end);
        white-space: nowrap;
        flex-basis: content;
    }
</style>
