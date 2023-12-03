<script setup>
import {RouterView} from 'vue-router'


import {ref} from 'vue'
import {Note} from "@/models/Note";

const drawer = ref(null)

const theme = ref(localStorage.getItem('theme') || 'light');

Note.class_events.on('save', () => {
	refresh_notes();
});

Note.class_events.on('delete', () => {
	refresh_notes();
});


const toggle_theme = () => {
	if (theme.value === 'light') {
		theme.value = 'dark';
	} else {
		theme.value = 'light';
	}
	localStorage.setItem('theme', theme.value);
}

const notes = ref([]);

const refresh_notes = async () => {
	let list = await Note.query();
	console.log({list});
	notes.value = list.map(note => {
		return {
			id: note.note_id,
			title: note.title,
			to: `/note/${note.note_id}`
		}
	});

	console.log(notes.value);
}

refresh_notes();
</script>

<template>
	<v-app :theme="theme">
		<v-navigation-drawer v-model="drawer">

			<template v-slot:prepend>
				<div class="pa-2">
					<v-list>
						<v-list-item to="/" color="primary" prepend-icon="mdi-plus">
							<v-list-item-title>New Note</v-list-item-title>
						</v-list-item>
					</v-list>
				</div>
			</template>


			<v-list>
				<v-list-subheader>
					Notes
				</v-list-subheader>
				<v-list-item
					v-for="note in notes"
					:to="note.to"
					:key="note.id"
					color="primary"
				>
					{{ note.title }}
				</v-list-item>
			</v-list>

			<template v-slot:append>
				<div class="pa-2">
					<v-btn :icon="true" @click="toggle_theme()" variant="flat">
						<v-icon>mdi-theme-light-dark</v-icon>
					</v-btn>
				</div>
			</template>
		</v-navigation-drawer>

		<v-app-bar>
			<v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

			<v-app-bar-title>Notepad</v-app-bar-title>

			<v-spacer></v-spacer>

		</v-app-bar>

		<v-main>
			<RouterView/>
		</v-main>
	</v-app>

</template>

<style scoped>
</style>
