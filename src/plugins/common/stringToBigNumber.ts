import { BigNumber } from "ethers";

export function stringToBigNumber(value: string)
{
    return BigNumber.from(Uint8Array.from(value, (char) => char.charCodeAt(0)));
}

export function bigNumberToString(value: BigNumber)
{
    let hex = value.toBigInt().toString(16);
    if (hex.length % 2) hex = "0" + hex;

    const bin = [];
    for (let i = 0; i < hex.length; i += 2) bin.push(String.fromCharCode(parseInt(hex.slice(i, i + 2), 16)));

    return bin.join("");
}