<script lang="ts">
    import { appContract } from "$/plugins/wallet";
    import { BigNumber } from "ethers";

    async function getPosts(from: BigNumber, limit: number) {
        const posts = [];
        const length = await appContract.postsLength();
        
        const end = from.add(limit);

        for (let i = from; i < (length.lt(end) ? length : end); i = i.add(1)) {
            posts.push(await appContract.posts(i));
        }

        return posts;
    }

    const posts = getPosts(BigNumber.from(0), 10);
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
