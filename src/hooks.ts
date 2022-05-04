import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async (input) => {
	return input.resolve(input.event, { ssr: false })
}