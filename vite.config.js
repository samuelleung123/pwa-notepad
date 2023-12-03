import {fileURLToPath, URL} from 'node:url'
import {VitePWA} from 'vite-plugin-pwa'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import icons from './public/icons.json';

// https://vitejs.dev/config/
export default defineConfig({
	base: '',
	build: {
		target: 'esnext'
	},
	plugins: [
		vue(),
		VitePWA({
			includeAssets: [
				"**/*.{png}"
			],
			registerType: 'autoUpdate',
			workbox: {
				clientsClaim: true,
				skipWaiting: true
			},
			manifest: {
				"name": "PWA Notepad",
				"short_name": "PWA Notepad",
				"start_url": ".",
				"display": "standalone",
				"background_color": "#ffffff",
				"description": "A simple notepad PWA",
				...icons,
			}
		})
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		}
	}
})
