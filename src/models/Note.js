import {Base_Model} from "@/models/Base_Model";

/**
 * @property {number} note_id
 * @property {string} title
 * @property {string} content
 * @property {string} created_at
 * @property {string} updated_at
 */
class Note extends Base_Model {
	static table = 'Note';
	static primary_key = 'note_id';

}

await Note.get_map();


export {
	Note,
}