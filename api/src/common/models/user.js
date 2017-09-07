import modelConfig from './user.json';
import Model from "../../server/database/model";

class User extends Model {
    constructor(app) {
        super(app, modelConfig);
    }
}

export default User;