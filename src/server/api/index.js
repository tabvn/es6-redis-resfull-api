import {version} from '../../../package.json';
import {Router} from 'express';
import Models from "../../model-config";

export default (app) => {

    let router = Router();
    app.set('router', router);
    app.set('models', new Models(app).getModels());

    router.get('/', (req, res) => {
        res.json({version});
    });

    return router;
}
