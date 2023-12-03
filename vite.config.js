import {fileURLToPath, URL} from 'node:url'
import {VitePWA} from 'vite-plugin-pwa'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
	base: '',
	build: {
		target: 'esnext'
	},
	plugins: [
		vue(),
		VitePWA({
			registerType: 'autoUpdate',
			workbox: {
				clientsClaim: true,
				skipWaiting: true
			}
		})
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		}
	}
})
