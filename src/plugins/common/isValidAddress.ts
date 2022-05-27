const example = '0x0000000000000000000000000000000000000000';
export function isValidAddress(address: string) {
    return example.length === address.length && address.startsWith('0x')
}