import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router'
import HomeView from "@/views/HomeView.vue";

const router = createRouter({
	history: createWebHashHistory(),
	routes: [
		{
			path: '/',
			name: 'home',
			component: HomeView,
		},
		{
			path: '/note/:id',
			name: 'note',
			component: HomeView,
			props: true,
		}
	]
})

export default router
