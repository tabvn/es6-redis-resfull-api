import modelConfig from './user.json';
import Model from "../../server/database/model";

class User extends Model {
    constructor(app) {
        super(app, modelConfig);

    }

    modelDidLoad() {

        let router = this.app.get('router');
        let basePath = this.plural;
        router.post('/' + basePath + '/login', (req, res) => {
            return this.responseHandler(res, {toan: true});
        });
    }
}

export default User;