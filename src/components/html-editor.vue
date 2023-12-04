<script setup>
import {onBeforeUnmount, onMounted, ref, watch} from 'vue'
import {delete_file, file_to_data_url, get_file, pick_file, save_file} from "@/helpers/file";
import {async_timeout} from "@/helpers/async_utils";


const props = defineProps({
	'modelValue': String,
	'minHeight': {
		type: String,
		default: '100px'
	},
	"maxHeight": {
		type: String,
		default: null
	},
})
const emit = defineEmits(['update:modelValue'])

const html = ref('')
const editor = ref(null)

html.value = props.modelValue;

// 監聽 editor dom 內部的html變化，並且觸發 emit
const observer = new MutationObserver(() => {
	emit('update:modelValue', editor.value.innerHTML)
})

// after mounted
onMounted(() => {
	observer.observe(editor.value, {
		childList: true,
		subtree: true,
		characterData: true,
		attributes: true,
	});
});

// before unmounted
onBeforeUnmount(() => {
	observer.disconnect()
})

const global_style = ref({
	bold: false,
	italic: false,
	underline: false,
})


// bold
const bold = () => {
	document.execCommand('bold', false, null);
	const selection = window.getSelection();
	if (selection.toString().length === 0) {
		global_style.value.bold = !global_style.value.bold;
		update_toggle_multiple()
		return;
	}
}

// italic
const italic = () => {
	document.execCommand('italic', false, null);
	const selection = window.getSelection();
	if (selection.toString().length === 0) {
		global_style.value.italic = !global_style.value.italic;
		update_toggle_multiple()
		return;
	}
}

// underline
const underline = () => {
	document.execCommand('underline', false, null);
	const selection = window.getSelection();
	if (selection.toString().length === 0) {
		global_style.value.underline = !global_style.value.underline;
		update_toggle_multiple()
		return;
	}
}

// ul
const ul = () => {
	document.execCommand('insertUnorderedList', false, null);
	update_toggle_multiple()
}

// ol
const ol = () => {
	document.execCommand('insertOrderedList', false, null);
	update_toggle_multiple()
}

// align left
const align_left = () => {
	document.execCommand('justifyLeft', false, null);
	update_toggle_multiple()
}

// align center
const align_center = () => {
	document.execCommand('justifyCenter', false, null);
	update_toggle_multiple()
}

// align right
const align_right = () => {
	document.execCommand('justifyRight', false, null);
	update_toggle_multiple()
}

// h1 to h6
const header = (tag) => {
	document.execCommand('formatBlock', false, `<${tag}>`);
	update_toggle_multiple()
}

// font size
const font_size_list = ref([
	{value: 1, title: 'x-small'},
	{value: 2, title: 'small'},
	{value: 3, title: 'medium'},
	{value: 4, title: 'large'},
	{value: 5, title: 'x-large'},
	{value: 6, title: 'xx-large'},
	{value: 7, title: 'xxx-large'},
])

const font_size = (size) => {
	document.execCommand('fontSize', false, size);
	update_toggle_multiple()
}


// image
const image = async () => {

	let url = null;
	/** @var {File[]} files */
	let files = await pick_file({
		multiple: true,
		accept: 'image/*'
	})

	for (const file of files) {
		let file_id = await save_file(file);
		let html_img = `<img data-file_id="${file_id}" /><br/>`

		let result = insert_html(html_img);
		if (!result) {
			editor.value.innerHTML += html_img;
		}
	}
	await update_media_src();
}

// video
const video = async () => {

	let url = null;
	/** @var {File[]} files */
	let files = await pick_file({
		multiple: true,
		accept: 'video/*'
	})

	for (const file of files) {
		let file_id = await save_file(file);
		let html_img = `<video data-file_id="${file_id}" controls></video><br/>`

		let result = insert_html(html_img);
		if (!result) {
			editor.value.innerHTML += html_img;
		}
	}
	await update_media_src();
}

// audio
const audio = async () => {

	let url = null;
	/** @var {File[]} files */
	let files = await pick_file({
		multiple: true,
		accept: 'audio/*'
	})

	for (const file of files) {
		let file_id = await save_file(file);
		let html_img = `<audio data-file_id="${file_id}" controls></audio><br/>`

		let result = insert_html(html_img);
		if (!result) {
			editor.value.innerHTML += html_img;
		}
	}
	await update_media_src();
}

const insert_html = (html) => {
	return document.execCommand('insertHTML', false, html);
}

// url
const url = () => {
	// convert selection to url
	let selection = window.getSelection();
	let url = selection.toString();
	if (url.length === 0) {
		return;
	}
	// check if url is valid
	if (!url.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)) {
		return;
	}
	// convert selection to a tag
	document.execCommand('insertHTML', false, `<a href="${url}" target="_blank">${url}</a>`);
}

// context menu
const context_menu = ref({
	open: false,
	x: 0,
	y: 0,
	type: null,
	media_el: null,
	media_menu: [
		{
			title: "Open", click: async () => {
				let data_url = context_menu.value.media_el.src;
				let blob = await (await fetch(data_url)).blob();
				let file = new File([blob], 'image.png', {type: blob.type});
				let url = URL.createObjectURL(file);
				window.open(url, '_blank');
			}
		},
		{
			title: 'Resize', click: () => {
				// console.log('resize');
				resize_image_dialog.value.media_el = context_menu.value.media_el;
				resize_image_dialog.value.width = context_menu.value.media_el.width;
				resize_image_dialog.value.height = context_menu.value.media_el.height;
				resize_image_dialog.value.open = true;

			}
		},
		{
			title: 'Save As', click: () => {
				let data_url = context_menu.value.media_el.src;
				let a = document.createElement('a');
				a.href = data_url;
				a.download = 'image.png';
				a.click();
			}
		},
		{
			title: 'Remove', click: () => {
				let file_id = context_menu.value.media_el.dataset.file_id;
				context_menu.value.media_el.outerHTML = "";
				if (file_id) {
					delete_file(file_id);
				}
			}
		}
	],
	a_el: null,
	a_menu: [
		{
			title: 'Open', click: () => {
				window.open(context_menu.value.a_el.href, '_blank');
			}
		},
		{
			title: 'Remove Link', click: () => {
				context_menu.value.a_el.outerHTML = context_menu.value.a_el.innerHTML;
			}
		}
	]

});


const open_context_menu = (event) => {
	context_menu.value.type = null;
	console.log('clicked', event.srcElement.nodeName);
	if (['IMG', 'VIDEO', 'AUDIO'].includes(event.srcElement.nodeName)) {
		context_menu.value.type = 'media';
		context_menu.value.media_el = event.srcElement;
	}
	if (event.srcElement.nodeName === 'A') {
		context_menu.value.type = 'a';
		context_menu.value.a_el = event.srcElement;
	}
	if (context_menu.value.type) {
		event.preventDefault();
		context_menu.value.open = true;
		context_menu.value.x = event.clientX;
		context_menu.value.y = event.clientY;
	}
}


// resize image dialog
const resize_image_dialog = ref({
	open: false,
	media_el: null,
	width: 0,
	height: 0,
	confirm() {
		if (this.width) {
			this.media_el.setAttribute('width', this.width);
		} else {
			this.media_el.removeAttribute('width');
		}
		if (this.height) {
			this.media_el.setAttribute('height', this.height);
		} else {
			this.media_el.removeAttribute('height');
		}
		this.close();
	},
	close() {
		this.open = false;
		this.media_el = null;
		this.width = 0;
		this.height = 0;
	}
});

const toggle_multiple = ref([])


const update_toggle_multiple = () => {

	const selection = window.getSelection();

	/** @var {Node} parent */

	toggle_multiple.value = [];

	if (selection.toString().length === 0) {
		if (global_style.value.bold) {
			toggle_multiple.value.push(0)
		}
		if (global_style.value.italic) {
			toggle_multiple.value.push(1)
		}
		if (global_style.value.underline) {
			toggle_multiple.value.push(2)
		}
		return;
	}

	const range = selection.getRangeAt(0)
	let parent = range.commonAncestorContainer

	if (parent.nodeName === '#text') {
		parent = parent.parentNode;
	}

	let style_map = parent.computedStyleMap();

	// if selection has bold, push 0 to toggle_multiple
	if (style_map.get('font-weight').value > 400) {
		toggle_multiple.value.push(0)
	}
	if (style_map.get('font-style').value === 'italic') {
		toggle_multiple.value.push(1)
	}
	if (style_map.get('text-decoration-line').value === 'underline') {
		toggle_multiple.value.push(2)
	}

	// console.log(toggle_multiple.value);
}

const update_media_src = async () => {
	await async_timeout(100);
	for (const el of editor.value.querySelectorAll('img[data-file_id], video[data-file_id], audio[data-file_id]')) {
		let file_id = el.dataset.file_id
		let old_src = el.src;
		if (old_src.includes('blob:')) {
			URL.revokeObjectURL(old_src);
		}
		let file = await get_file(file_id);
		el.src = URL.createObjectURL(file);
	}
}

update_media_src();
</script>

<template>
	<v-card>
		<div style="max-width: 100%; overflow-x: auto;">
			<div style="width: max-content">
				<v-btn-toggle
					:multiple="true"
					v-model="toggle_multiple"
					rounded="0"
					density="compact"
				>
					<v-btn @click="bold()" size="x-small">
						<v-icon size="x-large">mdi-format-bold</v-icon>
					</v-btn>
					<v-btn @click="italic()" size="x-small">
						<v-icon size="x-large">mdi-format-italic</v-icon>
					</v-btn>
					<v-btn @click="underline()" size="x-small">
						<v-icon size="x-large">mdi-format-underline</v-icon>
					</v-btn>

					<v-divider :vertical="true"></v-divider>

					<v-btn @click="ul()" size="x-small">
						<v-icon size="x-large">mdi-format-list-bulleted</v-icon>
					</v-btn>
					<v-btn @click="ol()" size="x-small">
						<v-icon size="x-large">mdi-format-list-numbered</v-icon>
					</v-btn>

					<v-divider :vertical="true"></v-divider>

					<v-btn @click="align_left()" size="x-small">
						<v-icon size="x-large">mdi-format-align-left</v-icon>
					</v-btn>
					<v-btn @click="align_center()" size="x-small">
						<v-icon size="x-large">mdi-format-align-center</v-icon>
					</v-btn>
					<v-btn @click="align_right()" size="x-small">
						<v-icon size="x-large">mdi-format-align-right</v-icon>
					</v-btn>

					<v-divider :vertical="true"></v-divider>

					<v-menu>
						<template v-slot:activator="{ props }">
							<v-btn v-bind="props" size="x-small">
								<v-icon size="x-large">mdi-format-header-pound</v-icon>
							</v-btn>
						</template>
						<v-list>
							<v-btn
								variant="text"
								@click="header('div')"
								:block="true"
							>
								Plain Text
							</v-btn>
							<v-btn
								v-for="index in 6"
								variant="text"
								@click="header('h' + index)"
								:block="true"
							>
								Header {{ index }}
							</v-btn>
						</v-list>
					</v-menu>

					<v-menu>
						<template v-slot:activator="{ props }">
							<v-btn v-bind="props" size="x-small">
								<v-icon size="x-large">mdi-format-size</v-icon>
							</v-btn>
						</template>
						<v-list>
							<v-btn
								v-for="size in font_size_list"
								variant="text"
								@click="font_size(size.value)"
								:block="true"
							>
								{{ size.title }}
							</v-btn>
						</v-list>
					</v-menu>

					<v-divider :vertical="true"></v-divider>

					<v-btn @click="image()" size="x-small">
						<v-icon size="x-large">mdi-image</v-icon>
					</v-btn>

					<v-btn @click="video()" size="x-small">
						<v-icon size="x-large">mdi-video</v-icon>
					</v-btn>

					<v-btn @click="audio()" size="x-small">
						<v-icon size="x-large">mdi-microphone</v-icon>
					</v-btn>

					<v-btn @click="url()" size="x-small">
						<v-icon size="x-large">mdi-link</v-icon>
					</v-btn>
				</v-btn-toggle>
			</div>
		</div>
		<v-divider></v-divider>
		<div ref="editor"
		     v-html="html"
		     style="min-height: 100px;padding: 15px; outline: none; resize: vertical; overflow: auto;"
		     :style="{minHeight: props.minHeight, maxHeight: props.maxHeight}"
		     contenteditable="true"
		     @mouseup="update_toggle_multiple"
		     @touchend="update_toggle_multiple"
		     @keyup="update_toggle_multiple"
		     @contextmenu="open_context_menu"
		></div>
	</v-card>
	<v-menu :target="[context_menu.x, context_menu.y]" v-model="context_menu.open">
		<v-list>
			<template v-if="context_menu.type">
				<v-list-item v-for="item in context_menu[context_menu.type + '_menu']" @click="item.click()">
					{{ item.title }}
				</v-list-item>
			</template>
		</v-list>
	</v-menu>
	<v-dialog v-model="resize_image_dialog.open" width="400px">
		<v-card>
			<v-card-title>Resize Image</v-card-title>
			<v-card-text style="display: flex; flex-direction: column; gap: 15px;">
				<v-text-field
					label="Width(px)"
					variant="outlined"
					v-model="resize_image_dialog.width"
					hide-details
				></v-text-field>
				<v-text-field
					label="Height(px) *leave empty to keep aspect ratio"
					variant="outlined"
					v-model="resize_image_dialog.height"
					hide-details
				></v-text-field>
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn @click="resize_image_dialog.close()" variant="text">Cancel</v-btn>
				<v-btn @click="resize_image_dialog.confirm()" variant="text" color="success">OK</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<style scoped>

</style>