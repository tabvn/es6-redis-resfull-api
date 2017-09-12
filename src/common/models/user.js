import modelConfig from './user.json';
import Model from "../../server/database/model";

class User extends Model {
    constructor(app) {
        super(app, modelConfig);

    }

    modelDidLoad() {

        let router = this.app.get('router');
        let basePath = this.plural;
        let app = this.app;
        let that = this;
        // login router
        router.post('/' + basePath + '/login', (req, res) => {

            let body = req.body;
            if (!body || !body.email || !body.password) {
                return this.errorHandler(res, "Email or password is required.");
            }
            let indexKey = this.createIndexKey('email', body.email);
            this.findOneByIndex(indexKey, (err, user) => {

                if (err === null && user) {

                    let config = app.get('config');
                    let jwt = app.get('jwt');
                    let bcrypt = app.get('bcrypt');


                    bcrypt.compare(body.password, user.password, function (err, result) {
                        if (result === true) {

                            if (typeof user.password !== 'undefined') {
                                delete user.password;
                            }
                            let expire = config.tokenExpiresIn ? config.tokenExpiresIn : '7d';
                            let token = jwt.sign(user, app.get('superSecret'), {
                                expiresIn: expire
                            });
                            let accessToken = {
                                token: token,
                                user: user,
                                expire: expire
                            };
                            return that.responseHandler(res, accessToken);

                        } else {

                            that.errorHandler(res, "Login failed.");
                        }
                    });

                } else {
                    return that.errorHandler(res, "Login failed.");
                }

            });


        });
    }

    beforeSave(ctx, next) {

        // do your stuff inside this function before data is saved.

        let app = this.app;
        let bcrypt = app.get('bcrypt');
        if (ctx.isNewInstance && ctx.instance.password) {
            bcrypt.hash(ctx.instance.password, 10, function (err, hash) {
                // Store hash in your password DB.
                ctx.instance.password = hash;
                next();
            });
        } else {
            next();
        }
    }

    afterSave(ctx, next) {
        // to do after model is saved.
        super.afterSave(ctx, next);
        next();
    }
}

export default User;