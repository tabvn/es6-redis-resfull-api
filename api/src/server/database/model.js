import each from 'async/each';
import _ from 'lodash';

export default class Model {

    constructor(app, config) {

        this.app = app;
        this.db = app.get('db');
        this.name = config.name;
        this.plural = config.plural;
        this.config = config;

        this.findAll = this.findAll.bind(this);
        this.findById = this.findById.bind(this);
        this.deleteById = this.deleteById.bind(this);
        this.count = this.count.bind(this);
        this.router = this.router.bind(this);
        this.updateById = this.updateById.bind(this);
        this.errorHandler = this.errorHandler.bind(this);
        this.responseHandler = this.responseHandler.bind(this);
        this.sort = this.sort.bind(this);
        this.router = this.router();
    }

    router() {

        let that = this;
        let router = this.app.get('router');
        let basePath = this.plural;
        router.get('/' + basePath, (req, res) => {
            that.findAll(null, (err, models) => {
                if (err) {
                    that.errorHandler(res, err, 500);
                } else {
                    return that.responseHandler(res, models);
                }
            });

        });


        router.get('/' + basePath + '/:id', function (req, res) {
            that.findById(req.params.id, (err, obj) => {
                if (err === null && obj) {

                    return that.responseHandler(res, obj);
                } else {
                    return that.errorHandler(res, err ? err : "Model not found", 404);
                }
            });

        });

        router.post('/' + basePath, (req, res) => {
            that.create(req.body, (err, obj) => {
                if (err) {
                    return that.errorHandler(res, err, 500);
                } else {
                    return that.responseHandler(res, obj);
                }
            });

        });

        router.put('/' + basePath + '/:id', (req, res) => {

            let id = req.params.id;
            let data = req.body;

            that.findById(id, (err, obj) => {
                if (err === null && obj) {
                    that.updateById(id, Object.assign(data, {id: id}), (err) => {
                        if (err) {
                            return that.errorHandler(res, err);
                        } else {
                            return that.responseHandler(res, data);
                        }
                    });
                } else {
                    that.errorHandler(res, err ? err : "Model not found", 404);
                }
            })

        });


        router.delete('/' + basePath + '/:id', (req, res) => {

            let id = req.params.id;
            that.deleteById(id, (err, success) => {
                if (err) {
                    return that.errorHandler(res, error);
                }
                else {
                    that.responseHandler(res, {count: success}, 204);
                }
            });
        });


    }


    findAll(filter = {}, callback) {

        let fields = this.config.properties;
        
        let sortArg = [
            this.plural,
            "BY",
            "*->id",
            "ALPHA",
            "DESC"
        ];

        _.each(fields, (fieldSetting, field) => {

            sortArg.push('GET');
            sortArg.push('*->' + field);

        });

        this.sort(...sortArg, (err, values) => {
            return callback(err, values);
        });
    }

    sort() {
        let
            sortArguments = Array.prototype.slice.call(arguments),
            originalCb = Array.prototype.slice.call(arguments).slice(-1)[0],
            fields = [];

        sortArguments.splice(-1, 1);

        sortArguments.forEach(function (anArgument, argumentIndex) {
            //if the argument is some form of 'get'
            if (anArgument.toLowerCase() === 'get') {
                //special pattern for getting the key
                if (sortArguments[argumentIndex + 1] === '#') {
                    //push it into the fields array
                    fields.push('#');
                } else {
                    //otherwise split the pattern by '->', retrieving the latter part
                    //and push it into the fields object
                    fields.push(sortArguments[argumentIndex + 1].split('->')[1]);
                }
            }
        });

        //run the normal sort
        this.db.sort.apply(
            this.db, //the `this` argument of the sort should be the client
            [
                sortArguments, //just the sort arguments without the callback
                function (err, values) {
                    if (err) {
                        originalCb(err);
                    } else {
                        values = _(values)
                            .chunk(fields.length)
                            .map(function (aValueChunk) {
                                return _.zipObject(fields, aValueChunk);
                            })
                            .value();
                        originalCb(err, values);
                    }

                }
            ]
        );
    }


    count(filter = {}, callback) {
        this.db.scard(this.plural, (err, num) => {
            return callback(err, num);
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

    updateById(id, data, callback) {

        if (typeof id === "undefined" || id === null) {
            return callback(new Error("Model not found"));
        }
        this.findById(id, (err, model) => {
            if (err === null && model) {
                let key = this.name + ':' + id;
                this.db.hmset(key, data, function (err) {

                    return callback(null, data);
                });
            } else {
                return callback(new Error("Model not found."));
            }
        });
    }

    deleteById(id, callback) {
        if (typeof id === "undefined" || id === null) {
            return callback(new Error("Model not found"));
        }
        let key = this.name + ":" + id;
        let that = this;

        this.db.del(key, (err, success) => {
            that.db.srem(that.plural, key);
            return callback(err, success);
        });
    }

    errorHandler(res, err, code = 500) {
        return res.status(code).json({error: err})
    }

    responseHandler(res, data, code = 200) {
        return res.status(code).json(data);
    }

}