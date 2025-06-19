import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(), 
		alias: {
			"$assets": "src/assets",
			"$src": "src",
		},
		csp: {
			directives: {
				'default-src': ['self'],
				'script-src': ['self', 'unsafe-inline', 'unsafe-eval'],
				'style-src': ['self', 'unsafe-inline'],
				'img-src': ['self', 'data:', 'blob:'],
				'font-src': ['self'],
				'connect-src': ['self'],
				'media-src': ['self', 'blob:'],
				'object-src': ['none'],
				'frame-src': ['none'],
				'worker-src': ['self', 'blob:'],
				'manifest-src': ['self']
			},
			mode: 'hash'
		}
	},
};

export default config;
