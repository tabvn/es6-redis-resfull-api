import {version} from '../../package.json';
import {Router} from 'express';
import User from "../models/user";

export default ({app}) => {
    let router = Router();
    app.set('router', router);
    let models = {
        user: new User(app)
    };

    app.set('models', models);

    router.get('/', (req, res) => {
        res.json({version});
    });

    return router;
}
