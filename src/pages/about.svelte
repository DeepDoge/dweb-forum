<script lang="ts">
    import deployed from "$/tools/hardhat/scripts/deployed.json";
    import { chainOptions } from "$/tools/wallet";
</script>

<article>
    <section>
        <h1>What is DForum</h1>
        <p>DForum is a social media or forum site/app that has been made with Web3+IPFS technologies.</p>
    </section>

    <section>
        <h2>What is IPFS?</h2>
        <p>
            IPFS is a file sharing protocol similar to torrent. Difference is IPFS finds the file purely based on the `hash` of the file.
            <b>A Hash is a generated key/id from a content such as file.</b>
        </p>
    </section>

    <section>
        <h2>What is Web3</h2>
        <p>
            Web3 can be called for many things but mainly it's used to describe Apps/Backends made with <b>blockchain</b> <b>smart contract code</b>,
            such as Ethereum or Polygon
        </p>
        <p>It means backend of the app is a <b>smart contract code</b> which means the logic or the data can't be changed(if it's not proxied).</p>
    </section>

    <section>
        <h2>How do we use IPFS and Web3</h2>
        <p>We use IPFS to host the site/app's front-end/user interface code and files such as HTML, JS, CSS, Image and etc.</p>
        <p>And we use Web3 as a backend or database</p>
    </section>

    <section>
        <h2>What is .eth or ENS?</h2>
        <p>
            ENS is a smart contract on the Ethereum Blockchain that let's you claim a unique name/domain fully decenterlized. And you can set metadata
            on the name you claimed, such as IPFS hash, your email, or site, or wallet address.
        </p>
        <p>If you have a claimed primary ENS name, the front-end shows that to the other users instead of your address.</p>
        <p>
            We also use the ENS name <i>dforum.eth</i> which stores an IPFS hash for this site. So instead of using the hash, you can just use
            <a href="ipns://dforum.eth">ipns://dforum.eth</a>
            to access to this site. Or if your browser doesn't have support for IPFS such as <a href="https://brave.com/">Brave Browser</a>, you can use
            a centerlized gateways such as <a href="https://dforum.eth.link">https://dforum.eth.link</a>
        </p>
    </section>

    <section>
        <h2>Where does my posts are being stored at?</h2>
        <p>The posts normally are being stored on the Smart Contract Blockchain Database. But we still have two options to post something:</p>
        <b>Post:</b>
        <p>
            Normally posts are full on the blockchain but since posts are forever on the blockchain and we might not want that by default as an
            avarage user.
        </p>
        <p>
            We first pin the post's content to IPFS and only post the hash/id/key to that IPFS content to blockchain. So we give a
            chance for the content of the post to be lost.
        </p>
        <b>Perma Post:</b>
        <p>And if you don't care, you can just post the whole content directly on the blockchain. So it's permanent for sure.</p>
    </section>

    <section>
        <h2>Where does my nickname stored at?</h2>
        <p>
            Profile data such as nicknames, avatars or bio is stored at our Profile contract.
        </p>
        <p>
            Profile contract is a simple contract. It stores any
            256bit key/value pair you throw at it under your wallet address. Then for example our front-end can ask for "nickname" value for
            "0xabc..." address.
        </p>
    </section>

    <section>
        <h2>Contract Addresses</h2>
        <ul>
            {#each chainOptions as option (option.chainId)}
                <li>
                    <b>{option.chainName}</b>
                    {#each Object.entries(deployed[parseInt(option.chainId, 16)]) as [contractName, contractAddress] (contractAddress)}
                        <div><b>{contractName}</b>: {contractAddress}</div>
                    {/each}
                </li>
            {/each}
        </ul>
    </section>
</article>

<style>
    article {
        display: grid;
        gap: calc(var(--k-padding) * 10);
        font-size: var(--k-font-smaller);
    }

    section {
        display: grid;
        gap: calc(var(--k-padding) * 2.5);
    }

    a {
        color: var(--k-color-slave);
        text-decoration: underline;
    }

    ul {
        display: grid;
        gap: calc(var(--k-padding) * 1);
    }

    h1::before {
        content: "# ";
    }

    h2::before {
        content: "## ";
    }
</style>
