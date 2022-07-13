# What is this?
This is a Web3 + IPFS based forum, or social media, or how ever you wanna call it, idk.

[![forthebadge](https://forthebadge.com/images/badges/0-percent-optimized.svg)](https://forthebadge.com) <br />
[![forthebadge](https://forthebadge.com/images/badges/60-percent-of-the-time-works-every-time.svg)](https://forthebadge.com) <br />
[![forthebadge](https://forthebadge.com/images/badges/powered-by-black-magic.svg)](https://forthebadge.com)

# How to use it?
It's still in early stages. <br />
But if you wanna try it, 
the [aa1dfad](https://github.com/DeepDoge/web3-forum/commit/aa1dfad08986ffb90da88f6958b4df9c1180b078) version is live on Polygon Network at: <br /> 
- ipfs://bafybeic65ryu4sdhfm667l6bydhz6vxqbxojw3ztrn3wdrfeiyyopmxrte
- https://bafybeic65ryu4sdhfm667l6bydhz6vxqbxojw3ztrn3wdrfeiyyopmxrte.ipfs.infura-ipfs.io/
- https://bafybeic65ryu4sdhfm667l6bydhz6vxqbxojw3ztrn3wdrfeiyyopmxrte.ipfs.dweb.link
- https://bafybeic65ryu4sdhfm667l6bydhz6vxqbxojw3ztrn3wdrfeiyyopmxrte.ipfs.cf-ipfs.com
 <br />
Ok so i made chages to use the event logs as store instead of SSTORE or SSTORE2(Contract). <br />
So instead of storing data on the state or contract, i just use the block. <br />
Which is right way to do it but im not sure if its the right way for this project. <br />

# TODO
To anyone looking at this I'm having trouble getting ENS names from Ethereum provider using `ethers` -> `JsonRpcProvider` -> `lookupAddress`.
It only works with `Web3Provider` aka the web3 wallet like metamask. I need to get ENS name directly from `JsonRpcProvider` maybe via making the raw request myself but not sure how atm. It would be cool if anyone can help :)

- Also in the final product there will be a settings page to change, add readonly json rpc providers. So users can choose to use different providers or their own local node etc.
