import { promiseQueue } from '$/utils/common/promiseQueue'
import { weakRecord } from '$/utils/common/weakRecord'
import { service } from '$/utils/service'
import { globalEventNotificationManager } from '$lib/kicho-ui/components/KEventNotification.svelte'
import { globalTaskNotificationManager } from '$lib/kicho-ui/components/KTaskNotification.svelte'
import CID from 'cids'
import type { IPFSHTTPClient } from 'ipfs-http-client'
import { get, readable, writable, type Readable, type Subscriber, type Writable } from 'svelte/store'

export interface IpfsClient
{
    api: IPFSHTTPClient
    config: Config
    toURL(hash: string): string
    getBytes(hash: string): Promise<Uint8Array>
}

interface Config
{
    gateway: string
    api: string
}

export const defaultIpfsConfigs: () => Config[] = () => [
    {
        api: 'http://127.0.0.1:5001',
        gateway: 'http://127.0.0.1:8080/'
    },
    {
        api: 'https://dweb.link',
        gateway: 'https://ipfs.dweb.link'
    }
]
export const ipfsConfigs: Writable<Config[]> = writable(JSON.parse(localStorage.getItem("ipfs-config")) ?? defaultIpfsConfigs())

const ipfs = service('IPFS', {
    'connecting': 'Connecting...',
    'nothing': 'No IPFS connection is accessible',
    'ready': 'Ready'
}, (setState) =>
{
    ipfsConfigs.subscribe((configs) => localStorage.setItem('ipfs-config', JSON.stringify(configs)))

    const cache = weakRecord<Uint8Array>()
    const onIpfsAPIsUpdate = promiseQueue(async (set: Subscriber<IpfsClient>, configs: Config[]) => 
    {
        set(null)
        setState('connecting')
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
                        hash = new CID(hash).toV1().toString('base32')
                        const url = new URL(config.gateway)
                        return `${url.protocol}//${hash}.${url.host}`
                    },
                    async getBytes(hash)
                    {
                        if (cache.has(hash)) return cache.get(hash)
                        cache.set(hash, new Uint8Array(await (await fetch((this as IpfsClient).toURL(hash))).arrayBuffer()))
                        return cache.get(hash)
                    }
                })
                console.log(`Using IPFS API ${config.api}`)
                setState('ready')
                return
            }
            catch (error)
            {
                console.log(`IPFS API ${config.api} is not accessible`)
            }
        }

        console.error('No IPFS connection is accessible')
        globalEventNotificationManager.append('No IPFS connection is accessible. Some features may not work.')
        setState('nothing')
    })

    const ipfsClient: Readable<IpfsClient> = readable(null, (set) => ipfsConfigs.subscribe(async (configs) => 
    {
        const cache = get(ipfsClient)
        if (cache === null) 
        {
            onIpfsAPIsUpdate(set, configs)
            return
        }
        await globalTaskNotificationManager.append(onIpfsAPIsUpdate(set, configs), "IPFS Client Updating...")
        await globalEventNotificationManager.append("IPFS Client Updated")
    }))

    return ipfsClient
})

export const ipfsClient = ipfs.service
export const ipfsState = ipfs.state

export function isIpfsHash(hash: string)
{
    return /[A-Za-z0-9]/.test(hash) &&
        (
            hash.startsWith('Qm') ? hash.length === 46 :
                hash.startsWith('bafy') ? hash.length === 59 : false
        )
}