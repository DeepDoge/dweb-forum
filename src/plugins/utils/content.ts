import CID from "cids"
import { BigNumber } from "ethers"
import { isValidAddress } from "./isValidAddress"
import { isValidIpfsHash } from "./isValidIpfsHash"
import { bigNumberAsBytes, bytesAsString, stringAsBytes } from "./bytes"

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

function encodeItem(item: ContentItem, bytes: Uint8Array): Uint8Array
{
    let lengthBytes = bigNumberAsBytes(BigNumber.from(bytes.length))
    while (lengthBytes.length < 2) lengthBytes = new Uint8Array([0, ...lengthBytes])
    return new Uint8Array([...new Uint8Array([item.type]), ...lengthBytes, ...bytes])
}

export function encodeContent(content: Content): ContentEncoded
{
    const itemsData: number[] = [] 
    for (const item of content.items)
    {
        switch (item.type)
        {
            case ContentType.IpfsLink:
            case ContentType.IpfsImage:
                itemsData.push(...encodeItem(item, new CID(item.data).toV0().multihash))
                break
            case ContentType.Mention:
                itemsData.push(...encodeItem(item, new Uint8Array([parseInt(item.data)])))
                break
            case ContentType.Text:
                itemsData.push(...encodeItem(item, stringAsBytes(item.data)))
                break
        }
    }

    return { mentions: content.mentions, itemsData: new Uint8Array(itemsData) }
}

export function decodeContent(contentEncoded: ContentEncoded): Content
{
    const content: Content = { mentions: contentEncoded.mentions, items: [] }

    const enum State
    {
        Type,
        Length,
        Data
    }

    let type: ContentType
    let lengthData: number[] = []
    let length: number
    let data: number[] = []
    let state: State = State.Type

    for (const byte of contentEncoded.itemsData)
    {
        switch (state)
        {
            case State.Type:
                state = State.Length
                type = byte
                break
            case State.Length:
                lengthData.push(byte)
                if (lengthData.length === 2)
                {
                    state = State.Data
                    length = BigNumber.from(new Uint8Array(lengthData)).toNumber()
                    lengthData = []
                }
                break
            case State.Data:
                data.push(byte)
                if (data.length === length)
                {
                    state = State.Type
                    const dataBytes = new Uint8Array(data)
                    const item: ContentItem = { type, data: null }
                    switch (item.type)
                    {
                        case ContentType.IpfsLink:
                        case ContentType.IpfsImage:
                            item.data = new CID(0, 'dag-pb', dataBytes).toV0().toString()
                            break
                        case ContentType.Mention:
                            item.data = dataBytes[0].toString()
                            break
                        case ContentType.Text:
                            item.data = bytesAsString(dataBytes)
                            break
                    }
                    content.items.push(item)
                    data = []
                }
                break
        }
    }

    return content
}

export function parseContent(contentText: string): Content
{
    contentText = contentText.trim()
    const mentions: string[] = []
    const parts = contentText.split(' ')
    const items: ContentItem[] = []
    for (const part of parts)
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
                        items.push({ type: ContentType.IpfsImage, data })
                    else throw new Error(`Invalid image ${data}`)
            }
        }
        else if (isValidIpfsHash(part))
            items.push({ type: ContentType.IpfsLink, data: part })
        else if (isValidAddress(part))
        {
            const index = mentions.length
            mentions.push(part)
            items.push({ type: ContentType.Mention, data: index.toString() })
        }
        else if (items.length > 0 && items[items.length - 1].type === ContentType.Text)
            items[items.length - 1].data += ` ${part}`
        else items.push({ type: ContentType.Text, data: part })
    }

    return { mentions, items }
}