import CID from "cids"
import { BigNumber } from "ethers"
import { isValidAddress } from "./isValidAddress"
import { isValidIpfsHash } from "./isValidIpfsHash"
import { bytesToString, bigNumberArrayToString, stringToBytes, bigNumberToString, stringToBigNumber, bigNumberToBytes } from "./string"

export const enum ContentType
{
    Null,
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
    itemsData: string
}

export interface ContentItem
{
    type: ContentType
    data: string
}

function encodeItem(item: ContentItem, bytes: Uint8Array): string
{
    let lengthString = bigNumberToString(BigNumber.from(bytes.length))
    while (lengthString.length < 2) lengthString = `\0${lengthString}`
    return `${bytesToString(new Uint8Array([item.type]))}${lengthString}${bytesToString(bytes)}`
}

export function encodeContent(content: Content): ContentEncoded
{
    const itemsData = content.items.map((item) =>
    {
        switch (item.type)
        {
            case ContentType.IpfsLink:
            case ContentType.IpfsImage:
                return encodeItem(item, new CID(item.data).bytes)
            case ContentType.Mention:
                return encodeItem(item, new Uint8Array([parseInt(item.data)]))
            case ContentType.Text:
                return encodeItem(item, stringToBytes(item.data))
        }
    }).join('')

    return { mentions: content.mentions, itemsData }
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
    let lengthData: string = ''
    let length: number
    let data: string = ''
    let state: State = State.Type

    for (const char of contentEncoded.itemsData)
    {
        switch (state)
        {
            case State.Type:
                state = State.Length
                type = stringToBytes(char)[0]
                break
            case State.Length:
                lengthData += char
                if (lengthData.length === 2)
                {
                    state = State.Data
                    length = stringToBigNumber(lengthData).toNumber()
                    lengthData = ''
                }
                break
            case State.Data:
                data += char
                if (data.length === length)
                {
                    state = State.Type
                    const item: ContentItem = { type, data: null }
                    switch (item.type)
                    {
                        case ContentType.IpfsLink:
                        case ContentType.IpfsImage:
                            item.data = new CID(stringToBytes(data)).toV0().toString()
                            break
                        case ContentType.Mention:
                            item.data = stringToBytes(data)[0].toString()
                            break
                        case ContentType.Text:
                            item.data = data
                            break
                    }
                    console.log(item)
                    content.items.push(item)
                    data = ''
                }
                break
        }
    }

    return content
}

export function parseContent(contentText: string): Content
{
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