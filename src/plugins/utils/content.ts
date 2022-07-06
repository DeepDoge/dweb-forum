import CID from "cids"
import { ethers } from "hardhat"
import { bytesToUtf8, utf8AsBytes } from "./bytes"
import { isValidIpfsHash } from "./isValidIpfsHash"

export const enum ContentType
{
    Text,
    Mention,
    IpfsLink,
    IpfsImage
}

export interface Content
{
    mentions: string[]
    items: ContentItem[]
}

export interface ContentEncoded
{
    mentions: string[]
    itemsData: Uint8Array
}

export interface ContentItem
{
    type: ContentType
    data: string
}

export function encodeContent(content: Content): ContentEncoded
{
    let encoded: string[] = []
    for (const item of content.items)
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

    return { mentions: content.mentions, itemsData: utf8AsBytes(encoded.join(' ')) }
}

export function decodeContent(contentEncoded: ContentEncoded): Content
{
    const content: Content = { mentions: contentEncoded.mentions, items: [] }

    const encodedContentString = bytesToUtf8(contentEncoded.itemsData)
    if (!encodedContentString) return content
    const parts = encodedContentString.split(' ')
    const items: ContentItem[] = content.items
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
                    if (isValidIpfsHash(data))
                        return items.push({ type: ContentType.IpfsImage, data })
            }
        }

        if (isValidIpfsHash(part))
            items.push({ type: ContentType.IpfsLink, data: part })
        else if (part.startsWith('0x') && part.length === '0x0'.length)
            items.push({ type: ContentType.Mention, data: parseInt(part, 16).toString() })
        else if (items.length > 0 && items[items.length - 1].type === ContentType.Text)
            items[items.length - 1].data += ` ${part}`
        else items.push({ type: ContentType.Text, data: part })
    })

    return content
}

export function parseContent(account: string, contentText: string, mentions: string[] = []): Content
{
    contentText = contentText.trim()
    const parts = contentText.split(' ')
    const items: ContentItem[] = []
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
                    if (isValidIpfsHash(data))
                        return items.push({ type: ContentType.IpfsImage, data })
            }
        }

        if (isValidIpfsHash(part))
            items.push({ type: ContentType.IpfsLink, data: part })
        else if (mentions.length < 8 && ethers.utils.isAddress(part) && part.toLowerCase() !== account.toLowerCase())
        {
            const index = mentions.length
            mentions.push(part)
            items.push({ type: ContentType.Mention, data: index.toString() })
        }
        else if (items.length > 0 && items[items.length - 1].type === ContentType.Text)
            items[items.length - 1].data += ` ${part}`
        else items.push({ type: ContentType.Text, data: part })
    })

    return { mentions, items }
}