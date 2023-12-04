import {localforage} from "@/lib/DataModel.min";
import {uuidv4} from "@/helpers/uuid";

/**
 *
 * @param {File} file
 * @return {Promise<string>}
 */
export const file_to_data_url = async (file) => {
	const reader = new FileReader()
	reader.readAsDataURL(file)
	return new Promise((resolve, reject) => {
		reader.onload = () => resolve(reader.result)
		reader.onerror = (error) => reject(error)
	})
}

export const pick_file = async (options = {}) => {
	return new Promise((resolve, reject) => {
		let input = document.createElement('input')
		input.type = 'file'
		input.accept = options.accept || '*/*'
		input.multiple = options.multiple || false
		input.onchange = () => {
			resolve([...input.files])
		}
		input.click()
	})
}

const file_storage = localforage.createInstance({
	name: 'file_storage'
});

/**
 * save the file to local storage (localforage) and return the file_id
 * @param file
 * @return {Promise<string>}
 */
export const save_file = async (file) => {
	let id = uuidv4();
	await file_storage.setItem(id, file);
	return id;
}

/**
 * get the file from local storage (localforage) by file_id
 * @param file_id
 * @return {Promise<File>}
 */
export const get_file = async (file_id) => {
	return await file_storage.getItem(file_id);
}

export const delete_file = async (file_id) => {
	return await file_storage.removeItem(file_id);
}