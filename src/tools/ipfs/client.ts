import { promiseQueue } from '$/utils/common/promiseQueue'
import { globalDialogManager } from "$lib/kicho-ui/components/KDialog.svelte"
import CID from 'cids'
import type { IPFSHTTPClient } from 'ipfs-http-client'
import { readable, writable, type Readable, type Subscriber, type Writable } from 'svelte/store'

interface Client
{
    api: IPFSHTTPClient
    config: Config
    toURL(hash: string): string
    validateHash(hash: string): boolean
}

interface Config
{
    gateway: string
    api: string
}

export const ipfsConfigs: Writable<Config[]> = writable([
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
            const api: IPFSHTTPClient = (window as any).IpfsHttpClient.create({ url: config.api })
            await api.version()
            set({
                api,
                config,
                toURL(hash)
                {
                    hash = new CID(hash).toV0().toString()
                    return `${config.gateway}${hash}`
                },
                validateHash(hash)
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
                },
            })
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