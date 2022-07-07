import { BigNumber } from "ethers"

export function utf8AsBytes(value: string): Uint8Array
{
    const encoder = new TextEncoder()
    return encoder.encode(value)
}

export function utf8AsBytes32(value: string): Uint8Array
{
    return bytesToBytes32(utf8AsBytes(value))
}

export function bytesToUtf8(bytes: Uint8Array): string
{
    if (bytes[0] === 0) return null
    const decoder = new TextDecoder('utf-8', { fatal: true })
    return decoder.decode(bytes).replace(/\0/g, '')
}

export function bytesToBytes32(bytes: Uint8Array = new Uint8Array()): Uint8Array
{
    if (bytes.length > 32) throw new Error(`Max byte size is 32. Current size is ${bytes.length}`) // 8 bit * 32 = 256 bits. so its same as uint256 in solidity
    return new Uint8Array([...bytes, ...Array(32 - bytes.length).fill(0)])
}

export function bytesToBytes32Array(bytes: Uint8Array, minLength: number): Uint8Array[]
{
    const arr: Uint8Array[] = []
    for (let i = 0; i < bytes.length; i += 32)
    {
        const end = Math.min(i + 32, bytes.length)
        arr.push(bytesToBytes32(bytes.slice(i, end)))
    }
    while (arr.length < minLength) arr.push(bytesToBytes32(new Uint8Array()))
    return arr
}

export function hexToBytes(hex: string): Uint8Array 
{
    hex = hex.substring('0x'.length)
    const byteArray: number[] = []
    for (var i = 0; i < hex.length; i += 2)
        byteArray.push(parseInt(hex.substring(i, i + 2), 16))
    return new Uint8Array(byteArray)
}

export function hexToUtf8(hex: string): string 
{
    return bytesToUtf8(hexToBytes(hex))
}

export function combineBytes(arr: Uint8Array[]): Uint8Array
{
    const byteNumbers: number[] = []
    for (const bytes of arr)
        byteNumbers.push(...bytes)
    return new Uint8Array(byteNumbers)
}

export function bigNumberAsBytes(value: BigNumber): Uint8Array
{
    return hexToBytes(value._hex)
}

export function utf8AsBigNumber256(value: string)
{
    if (!value) return BigNumber.from(0)
    const bytes = utf8AsBytes(value)
    if (bytes.length > 32) throw new Error(`Max byte size is 32. Size of "${value}" is ${bytes.length}`) // 8 bit * 32 = 256 bits. so its same as uint256 in solidity
    return BigNumber.from(bytes)
}

export function bigNumberAsUtf8(number: BigNumber): string
{
    if (number.eq(0)) return null
    return bytesToUtf8(bigNumberAsBytes(number))
}
