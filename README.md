# What is this?
This is a Web3 + IPFS based forum, or social media, or how ever you wanna call it, idk.

[![forthebadge](https://forthebadge.com/images/badges/0-percent-optimized.svg)](https://forthebadge.com) <br />
[![forthebadge](https://forthebadge.com/images/badges/60-percent-of-the-time-works-every-time.svg)](https://forthebadge.com) <br />
[![forthebadge](https://forthebadge.com/images/badges/powered-by-black-magic.svg)](https://forthebadge.com)

# How to use it?
It's still in early stages. <br />
But if you wanna try it, 
the [6d72921](https://github.com/DeepDoge/web3-forum/commit/6d7292166cdfb848ae1ffd4d4b76617a2bc4962f) version is live on Polygon Network at: <br /> 
- ipfs://bafybeieeon63rysnnoavnb723s5r7ozjb7cpfvqyf6ircpufjg5xtupr7e
- https://bafybeieeon63rysnnoavnb723s5r7ozjb7cpfvqyf6ircpufjg5xtupr7e.ipfs.infura-ipfs.io/
- https://bafybeieeon63rysnnoavnb723s5r7ozjb7cpfvqyf6ircpufjg5xtupr7e.ipfs.dweb.link
- https://bafybeieeon63rysnnoavnb723s5r7ozjb7cpfvqyf6ircpufjg5xtupr7e.ipfs.cf-ipfs.com
 <br />
Ok so i made chages to use the event logs as store instead of SSTORE or SSTORE2(Contract). <br />
So instead of storing data on the state or contract, i just use the block. <br />
Which is right way to do it but im not sure if its the right way for this project. <br />

# TODO
To anyone looking at this I'm having trouble getting ENS names from Ethereum provider using `ethers` -> `JsonRpcProvider` -> `lookupAddress`.
It only works with `Web3Provider` aka the web3 wallet like metamask. I need to get ENS name directly from `JsonRpcProvider` maybe via making the raw request myself but not sure how atm. It would be cool if anyone can help :)

- Also in the final product there will be a settings page to change, add readonly json rpc providers. So users can choose to use different providers or their own local node etc.
