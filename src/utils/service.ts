import { readable, type Readable, type Subscriber } from "svelte/store"

export interface ServiceState
{
    type: string
    text: string
}

export interface Service<S>
{
    service: S
    state: Readable<ServiceState>
}

export type StateSetter<States extends Record<string, string>> = (state: Extract<keyof States, string>) => void
export type ServiceLoader<S, States extends Record<string, string>> = (setState: StateSetter<States>) => S

export function service<S, States extends Record<string, string>>(name: string, states: States, loader: ServiceLoader<S, States>): Readonly<Service<S>>
{
    const service: Service<S> = {
        service: null,
        state: readable<ServiceState>(null, (set) =>
        {
            try
            {
                service.service = loader((state: Extract<keyof States, string>) => set({
                    type: state,
                    text: `${name}: ${states[state]}`
                }))
            }
            catch (error)
            {
                console.error(error)
            }
        })
    }

    return service
}