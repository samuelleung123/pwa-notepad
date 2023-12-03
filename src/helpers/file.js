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