<script lang="ts">
    export let address: string;
</script>

<span aria-label={address} title={address} class="address text-inline" data-start={address.substring(0, 39)} data-end={address.substring(39)}>
    <span>{address}</span>
</span>

<style>
    .address {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: flex-start;
    }
    .address > span {
        display: none;
    }

    .address::before {
        content: attr(data-start);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex-shrink: 1;
    }

    .address::after {
        content: attr(data-end);
        white-space: nowrap;
        flex-basis: content;
        flex-grow: 0;
        flex-shrink: 0;
    }
</style>
