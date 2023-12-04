<script setup>
import HtmlEditor from "@/components/html-editor.vue";

import {onUnmounted, ref, watch} from 'vue'
import {Note} from "@/models/Note";
import moment from "moment";
import router from "@/router";
import {auto_save} from "@/states/auto_save";


const props = defineProps({
	'id': null,
})

watch(() => props.id, () => {
	refresh_note();
});

const interval_id = setInterval(() => {
	if (auto_save.value.enabled && record.value.is_changed()) {
		save_record();
	}
}, 1000);

onUnmounted(() => {
	clearInterval(interval_id);
});

const record = ref(null);
const refresh_note = async () => {
	record.value = null;

	let id = props.id;
	let note = null;
	if (!id) {
		note = new Note();
		let today = moment().format('YYYY-MM-DD');
		note.title = `${today} - New Note`;
		note.content = '';
	} else {
		note = await Note.get_by_id(id);

	}
	record.value = note;
}

const save_record = async () => {
	let is_new = !record.value.note_id;
	await record.value.save();
	if (is_new) {
		router.push('/note/' + record.value.note_id);
	}
}

const delete_record = () => {
	if(!confirm('Are you sure you want to delete this note?')) {
		return;
	}
	record.value.delete();
	router.push('/');
}

refresh_note();

</script>

<template>
	<div v-if="record" style="padding: 15px; display: flex; flex-direction: column; gap: 15px;">
		<v-text-field
			v-model="record.title"
			label="Title"
			variant="underlined"
			persistent-placeholder
			hide-details
		></v-text-field>
		<html-editor
			:key="record.note_id"
			v-model="record.content"
			min-height="200px"
		></html-editor>

		<div style="display: flex; gap: 15px;">
			<v-spacer></v-spacer>
			<v-btn v-if="record.note_id" @click="delete_record()" variant="text" color="error">Delete</v-btn>
			<v-btn @click="save_record()" variant="text" color="primary">Save</v-btn>
		</div>
	</div>
</template>

<style scoped>

</style>