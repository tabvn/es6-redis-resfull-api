import each from 'async/each';

export default class Model {

    constructor(app, config) {

        this.app = app;
        this.db = app.get('db');
        this.name = config.name;
        this.plural = config.plural;
        this.findAll = this.findAll.bind(this);
        this.findById = this.findById.bind(this);
        this.count = this.count.bind(this);
        this.router = this.router.bind(this);
        this.getRouterPath = this.getRouterPath.bind(this);

        this.router();
    }

    getRouterPath(path) {

        let value = path = this.plural + path;

        if (!value.startsWith('/')) {
            value = '/' + value;
        }
        return this.plural + path;
    }

    router() {

        let that = this;
        let router = this.app.get('router');

        router.get('/users', (req, res) => {
            that.findAll(null, (err, models) => {
                if (err) {
                    return res.sendStatus(500).json(err);
                } else {
                    return res.json(models);
                }
            });

        });


        router.get('/users/:id', function (req, res) {
            that.findById(req.params.id, (err, obj) => {
                if (err) {
                    return res.sendStatus(500).json(err);
                } else {

                    return res.json(obj);

                }
            });

        });

        router.post('/users', (req, res) => {
            that.create(req.body, (err, obj) => {
                if (err) {
                    return res.sendStatus(500).json(err);
                } else {
                    return res.json(obj);
                }
            });

        });


    }


    findAll(filter = {}, callback) {

        let models = [];
        let db = this.db;

        this.db.smembers(this.plural, (err, objects) => {
            each(objects, function (objKey, cb) {

                db.hgetall(objKey, function (err, modelObject) {
                    if (err == null && modelObject) {
                        modelObject = Object.assign(modelObject, {});
                        models.push(modelObject);
                    }
                    cb();
                });

            }, function (err) {
                return callback(err, models);
            });
        });

    }

    count(filter = {}, callback) {
        this.db.smembers(this.plural, (err, objects) => {
            return callback(err, objects && objects.length ? objects.length : null);
        });

    }

    findById(id, callback) {

        if (typeof id === 'undefined' || id === null) {
            return callback(new Error('Model not found.'));
        } else {

            let key = this.name + ':' + id;
            this.db.hgetall(key, (err, object) => {

                return callback(err, object);
            });
        }

    }

    create(model = {}, callback) {

        let db = this.db;

        this.count(null, (err, count) => {

            if (err) {

                return callback(err);
            } else {
                let key = this.name + ':' + count;
                model.id = count;
                db.hmset(key, model, (err) => {
                    if (err) {
                        return callback(err);
                    } else {
                        db.sadd(this.plural, key);
                        return callback(null, model);
                    }

                });

            }
        });


    }
}