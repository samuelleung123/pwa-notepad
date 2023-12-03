import {DataModel} from "@/lib/DataModel.min";

DataModel.db_name = 'pwa-notepad';
DataModel.get_db();

class Base_Model extends DataModel {

}

export {
	Base_Model,
}