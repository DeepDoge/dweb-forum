import adapter from '@sveltejs/adapter-static'
import path from 'path'
import preprocess from 'svelte-preprocess'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess({}),
	
	kit: {
		adapter: adapter(),
		prerender: {
			enabled: true
		},
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		vite:
		{
			plugins: [

			],
			resolve:
			{
				alias:
				{
					"$": path.resolve('./src'),
				}
			}
		}
	}
}

export default config
