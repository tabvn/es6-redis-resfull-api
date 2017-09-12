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

    beforeSave(ctx, next) {

        // do your stuff inside this function before data is saved.
        next();
    }

    afterSave(ctx, next) {
        // to do after model is saved.
        next();
    }
}

export default User;