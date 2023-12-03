import {ref} from "vue";

const auto_save = ref({
	enabled: localStorage.getItem('auto_save') === 'true',
	toggle() {
		this.enabled = !this.enabled
		localStorage.setItem('auto_save', this.enabled);
		this.event.dispatchEvent(new CustomEvent('change', {
			detail: {
				enabled: this.enabled,
			}
		}));
	},
	event: new EventTarget(),
});

export {
	auto_save,
}