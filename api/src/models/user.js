import modelConfig from './user.json';
import Model from "./model";

class User extends Model {
    constructor(app) {
        super(app, modelConfig);
    }
}

export default User;