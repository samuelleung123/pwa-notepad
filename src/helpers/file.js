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