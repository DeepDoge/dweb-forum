import { promiseQueue } from '$/utils/common/promiseQueue'
import { globalDialogManager } from '$lib/kicho-ui/dialog'
import CID from 'cids'
import { create, type IPFSHTTPClient } from 'ipfs-http-client'
import { type Readable, readable, writable, type Subscriber, get, type Writable } from 'svelte/store'

type Client = IPFSHTTPClient & { __config: Config }
interface Config
{
    gateway: string
    api: string
}

export const ipfsConfigs: Writable<Config[]> = writable([
    /*     {
            api: 'http://127.0.0.1:45005',
            gateway: 'http://localhost:48084/ipfs/'
        }, */
    {
        api: 'http://127.0.0.1:5001',
        gateway: 'http://127.0.0.1:5002/ipfs/'
    },
    {
        api: 'https://ipfs.infura.io:5001',
        gateway: 'https://ipfs.infura.io/ipfs/'
    }
])
export const ipfsClient: Readable<Client> = readable(null, (set) => ipfsConfigs.subscribe((configs) => onIpfsAPIsUpdate(set, configs)))

const onIpfsAPIsUpdate = promiseQueue(async (set: Subscriber<Client>, configs: Config[]) => 
{
    for (const config of configs)
    {
        try
        {
            const client: Client = create({ url: config.api }) as any
            await client.version()
            client.__config = config
            set(client)
            console.log(`Using IPFS API ${config.api}`)
            return
        }
        catch (error)
        {
            console.log(`IPFS API ${config.api} is not accessible`)
        }
    }
    console.error('No IPFS API is accessible')
    globalDialogManager.alert('No IPFS API is accessible. Some features may not work.')
})

export function getIpfsUrl(hash: string)
{
    const client = get(ipfsClient)
    hash = new CID(hash).toV0().toString()
    return `${client.__config.gateway}${hash}`
}

export function validateIpfsHash(hash: string)
{
    try
    {
        if (typeof hash !== 'string') throw ""
        new CID(hash)
        return true
    }
    catch
    {
        return false
    }
}