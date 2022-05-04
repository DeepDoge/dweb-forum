<script lang="ts">
    import { appContract } from "$/plugins/wallet";
    import { BigNumber } from "ethers";

    export let address: string;

    async function getPosts(from: BigNumber, limit: BigNumber) {
        const posts = [];
        const length = await appContract.ownerTimelineLength(address);
        
        const end = from.add(limit);

        for (let i = from; i < (length.gt(end) ? length : end); i = i.add(1)) {
            const postIndex = await appContract.ownerTimeline(address, i)
            posts.push(await appContract.posts(postIndex));
        }

        return posts;
    }

    const posts = getPosts(BigNumber.from(0), BigNumber.from(10));
</script>

{#await posts}
    Getting posts...
{:then posts}
    {#each posts as post (post.id)}
        <pre>
            {JSON.stringify(post)}
        </pre>
    {/each}
{/await}
