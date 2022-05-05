<script lang="ts">
    import { appContract } from "$/plugins/wallet";
import KBoxEffect from "$lib/kicho-ui/components/effects/KBoxEffect.svelte";
    import { BigNumber } from "ethers";

    async function getPosts(from: BigNumber, limit: number) {
        const posts = [];
        const length = await appContract.postsLength();
        
        const end = from.add(limit);

        for (let i = from; i < (length.lt(end) ? length : end); i = i.add(1)) {
            posts.push(await appContract.posts(i));
        }

        return posts as (Awaited<ReturnType<typeof appContract['posts']>>)[];
    }

    const posts = getPosts(BigNumber.from(0), 10);
</script>

{#await posts}
    Getting posts...
{:then posts}
    <div class="posts">
    {#each posts as post (post.id)}
        <div class="post">
            <KBoxEffect radius="rounded" background blur color="mode">
                <p>{post.content}</p>
            </KBoxEffect>
        </div>
    {/each}
</div>
{/await}


<style>
    .posts {
        display: grid;
        gap: 2em;
        justify-content: center;
        grid-template-columns: min(100%, 30em);
    }

    .post {
        display: grid;
        padding: var(--k-padding);
    }

    .post p {
        word-break: break-all;
    }
</style>
