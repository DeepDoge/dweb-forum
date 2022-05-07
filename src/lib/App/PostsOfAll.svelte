<script lang="ts">
    import { appContract } from "$/plugins/wallet";
    import type { BigNumber } from "ethers";

    async function getPosts(from: BigNumber, limit: number) {
        const posts = [];
        const end = from.sub(limit);

        for (let index = from; index.gte(end) && index.gt(0); index = index.sub(1)) posts.push(await appContract.posts(index));

        return posts as Awaited<ReturnType<typeof appContract["posts"]>>[];
    }

    const posts = appContract.postsLength().then((length) => getPosts(length.sub(1), 10));
</script>

{#await posts}
    Getting posts...
{:then posts}
    <slot {posts} />
{/await}
