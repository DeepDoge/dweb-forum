
export const isProtocolIpfs = location.protocol === "http:" && location.port !== "80" && location.href.includes("ipfs")
export function getIpfsUrl(QmHash: string)
{
    if (!QmHash) return null
    return isProtocolIpfs ? `ipfs://${QmHash}` : `https://ipfs.io/ipfs/${QmHash}`
}