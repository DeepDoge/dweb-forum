import { ipfsClient } from "$/tools/ipfs/client"
import CID from "cids"
import { ethers } from "ethers"
import { get } from "svelte/store"
import { bytesToUtf8, utf8AsBytes } from "./bytes"

export const enum ContentType
{
    Text,
    Mention,
    IpfsLink,
    IpfsImage
}

export interface PostContentData
{
    mentions: string[]
    items: PostContentItemData[]
}

export interface PostContentItemData
{
    type: ContentType
    data: string
}

export function encodePostContentItems(items: PostContentItemData[]): Uint8Array
{
    let encoded: string[] = []
    for (const item of items)
    {
        switch (item.type)
        {
            case ContentType.IpfsLink:
                encoded.push(new CID(item.data).toV0().toString())
                break
            case ContentType.IpfsImage:
                encoded.push(`img,${new CID(item.data).toV0().toString()}`)
                break
            case ContentType.Mention:
                encoded.push(`0x${item.data}`)
                break
            case ContentType.Text:
                encoded.push(item.data)
                break
        }
    }

    return utf8AsBytes(encoded.join(' '))
}

export function decodePostContentItems(encodedItems: Uint8Array): PostContentItemData[]
{
    const encodedContentString = bytesToUtf8(encodedItems)
    const parts = encodedContentString.split(' ')
    const items: PostContentItemData[] = []
    parts.forEach((part) =>
    {
        const index = part.indexOf(',')
        if (index >= 0 && index < part.length - 1 && index === part.lastIndexOf(','))
        {
            const type = part.substring(0, index)
            const data = part.substring(index + 1)
            switch (type)
            {
                case 'img':
                    if (get(ipfsClient).isIpfsHash(data))
                        return items.push({ type: ContentType.IpfsImage, data })
            }
        }

        if (get(ipfsClient).isIpfsHash(part))
            items.push({ type: ContentType.IpfsLink, data: part })
        else if (part.startsWith('0x') && part.length === '0x0'.length)
            items.push({ type: ContentType.Mention, data: parseInt(part, 16).toString() })
        else if (items.length > 0 && items[items.length - 1].type === ContentType.Text)
            items[items.length - 1].data += ` ${part}`
        else items.push({ type: ContentType.Text, data: part })
    })

    return items
}

export function parseContent(account: string, contentText: string, mentions: string[] = []): PostContentData
{
    contentText = contentText.trim()
    const parts = contentText.split(/([\n\s])/g)
    const items: PostContentItemData[] = []
    parts.forEach((part) =>
    {
        const index = part.indexOf(',')
        if (index >= 0 && index < part.length - 1 && index === part.lastIndexOf(','))
        {
            const type = part.substring(0, index)
            const data = part.substring(index + 1)
            switch (type)
            {
                case 'image':
                    if (get(ipfsClient).isIpfsHash(data))
                        return items.push({ type: ContentType.IpfsImage, data })
            }
        }

        if (get(ipfsClient).isIpfsHash(part))
            items.push({ type: ContentType.IpfsLink, data: part })
        else if (ethers.utils.isAddress(part))
        {
            const address = ethers.utils.getAddress(part)
            const index = mentions.indexOf(address)
            if (index >= 0) items.push({ type: ContentType.Mention, data: index.toString() })
            else items.push({ type: ContentType.Mention, data: (mentions.push(address) - 1).toString() })
        }
        else if (items.length > 0 && items[items.length - 1].type === ContentType.Text)
            items[items.length - 1].data += `${part}`
        else items.push({ type: ContentType.Text, data: part })
    })

    return { mentions, items }
}

export async function addPostContentItemsDataToIpfs(items: PostContentItemData[]): Promise<string>
{
    return (await get(ipfsClient).api.add(encodePostContentItems(items), { pin: true })).cid.toString()
}

export async function getPostContentItemsDataFromIpfs(hash: string): Promise<PostContentItemData[]>
{
    return decodePostContentItems(await get(ipfsClient).getBytes(hash))
}