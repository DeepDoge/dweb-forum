# What is this?
This is a Web3 + IPFS based forum, or social media, or how ever you wanna call it, idk.

[![forthebadge](https://forthebadge.com/images/badges/0-percent-optimized.svg)](https://forthebadge.com) <br />
[![forthebadge](https://forthebadge.com/images/badges/60-percent-of-the-time-works-every-time.svg)](https://forthebadge.com) <br />
[![forthebadge](https://forthebadge.com/images/badges/powered-by-black-magic.svg)](https://forthebadge.com)

# How to use it?
It's still in early stages. <br />
But if you wanna try it, 
the [198d807](https://github.com/DeepDoge/web3-forum/commit/198d8074b76c85be314b81093c4e27fc144fa73d) version is live on Polygon Network at: <br /> 
- ipfs://bafybeifwinosyf44ofl32jzxdr6bx6tz7emnnomprsnbtzyrt66iqbykee
- https://bafybeifwinosyf44ofl32jzxdr6bx6tz7emnnomprsnbtzyrt66iqbykee.ipfs.infura-ipfs.io/
- https://bafybeifwinosyf44ofl32jzxdr6bx6tz7emnnomprsnbtzyrt66iqbykee.ipfs.dweb.link
- https://bafybeifwinosyf44ofl32jzxdr6bx6tz7emnnomprsnbtzyrt66iqbykee.ipfs.cf-ipfs.com

**IPNS**
- ipns://dforum.eth
- https://dforum.eth.link/
- https://dforum-eth.ipns.dweb.link/


I was using event logs to store posts before, but decided its not the right way. Even thought it was spending less GAS

# TODO
To anyone looking at this I'm having trouble getting ENS names from Ethereum provider using `ethers` -> `JsonRpcProvider` -> `lookupAddress`.
It only works with `Web3Provider` aka the web3 wallet like metamask. I need to get ENS name directly from `JsonRpcProvider` maybe via making the raw request myself but not sure how atm. It would be cool if anyone can help :)

- Also in the final product there will be a settings page to change, add readonly json rpc providers. So users can choose to use different providers or their own local node etc.
- IMPORTANT, client side AI with TensorFlow.js or similar, that classifys images. maybe text later too. And blur the nsfw content based on the user configuration. 
