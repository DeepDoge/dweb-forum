<script lang="ts">
    import { getTimeline, TimelineId } from "$/plugins/api";
    import Post from "$lib/App/Post.svelte";
    import Posts from "$lib/App/Posts.svelte";
    import { BigNumber } from "ethers";

    let timelineId: TimelineId = { idType: 0, id: 0 };

    $: timelinePromise = getTimeline(timelineId);
    $: timelinePromise?.then(async (timeline) => await timeline.loadNewer());

    function stringToBigNumber(value: string) {
        return BigNumber.from(Uint8Array.from(window.atob(value), (char) => char.charCodeAt(0)));
    }
    function bigNumberToString(value: BigNumber) {
        let hex = value.toBigInt().toString(16);
        if (hex.length % 2) hex = "0" + hex;

        const bin = [];
        for (let i = 0; i < hex.length; i += 2) bin.push(String.fromCharCode(parseInt(hex.slice(i, i + 2), 16)));

        return window.btoa(bin.join(""));
    }
</script>

<div id="page">
    {stringToBigNumber("helloooo")}
    {bigNumberToString(stringToBigNumber("helloooo"))}
    {#await timelinePromise then timeline}
        <Posts {timeline} let:item>
            <div class="post">
                <Post postIndex={item.index} {timelineId} timelinePostIndex={item.timelinePostIndex} showReplies />
            </div>
        </Posts>
    {/await}
</div>

<style>
    #page {
        display: grid;
        grid-auto-flow: row;
        grid-template-columns: 1fr;
        gap: 0.5em;

        justify-content: center;
        grid-template-columns: min(50em, 100%);
    }

    .post {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: var(--k-padding);
    }

    .post::before {
        content: "‣";
        font-size: var(--k-font-xx-larger);
    }
</style>
