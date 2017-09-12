import _ from 'lodash';
import each from 'async/each';

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
        this.createIndexKey = this.createIndexKey.bind(this);
        this.modelDidLoad = this.modelDidLoad.bind(this);
        this.prepareData = this.prepareData.bind(this);
        this.beforeSave = this.beforeSave.bind(this);
        this.afterSave = this.afterSave.bind(this);
        this.findOneByIndex = this.findOneByIndex.bind(this);

    }

    modelDidLoad() {

    }


    beforeSave(ctx, next) {

        next();
    }

    afterSave(ctx, next) {
        next();

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

        router.get('/' + basePath + '/count', (req, res) => {

            let filter = {};

            that.count(filter, (err, count) => {
                if (err) {
                    return that.errorHandler(res, err)
                } else {
                    return that.responseHandler(res, {count: count});
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

        router.post('/' + basePath, (req, res, next) => {


            let ctx = {
                req: req,
                res: res,
                instance: req.body,
                isNewInstance: true
            };

            this.beforeSave(ctx, (err = null) => {
                if (err) {
                    this.errorHandler(res, err, 500);
                } else {
                    that.create(ctx.instance, (err, obj) => {
                        if (err) {
                            return that.errorHandler(res, err, 500);
                        } else {

                            ctx.instance = obj;
                            this.afterSave(ctx, (err = null) => {
                                if (err) {
                                    return this.errorHandler(res, err, 500);
                                } else {
                                    return that.responseHandler(res, obj);
                                }
                            });

                        }
                    });

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

        this.modelDidLoad();

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


    prepareData(model, callback) {

        let errors = [];
        let data = {};
        let uniqueFields = [];

        let db = this.db;
        let that = this;


        let fields = this.config.properties;
        _.each(fields, (fieldConfig, field) => {

            if (typeof fieldConfig.required !== 'undefined' && fieldConfig.required && _.isEmpty(_.get(model, field, null))) {
                errors.push({field: field, error: field + ' is required.'});
            }

            if (typeof model[field] !== 'undefined') {
                data[field] = model[field];
            }

            //check if unique
            if (typeof fieldConfig.index !== 'undefined' && fieldConfig.index && typeof fieldConfig.unique !== 'undefined' && fieldConfig.unique && typeof model[field] !== 'undefined' && model[field] !== null) {
                // we do need check Index. and unique
                uniqueFields.push(field);

            }

        });

        if (errors.length) {
            return callback(errors);
        } else {


            if (uniqueFields.length) {
                each(uniqueFields, function (field, cb) {

                    let key = that.createIndexKey(field, model[field]);
                    db.scard(key, (err, num) => {
                        if (err === null && num === 0) {
                            return cb();
                        } else {
                            return cb(field + ' is must unique.');
                        }
                    });

                }, function (err) {
                    // if any of the file processing produced an error, err would equal that error
                    if (err) {
                        return callback(err)
                    } else {
                        return callback(null, data);
                    }
                });
            } else {
                return callback(null, data);

            }
        }


    }

    createIndexKey(field, value) {
        return 'index:' + this.name + ":" + field + ':' + value;

    }

    create(model = {}, callback) {

        let db = this.db;

        this.prepareData(model, (err, data) => {

            if (err) {
                return callback(err);
            } else {

                this.count(null, (err, count) => {
                    if (err) {
                        return callback(err);
                    } else {
                        let key = this.name + ':' + count;
                        model.id = count;
                        model.createdAt = Date.now();

                        db.hmset(key, data, (err) => {
                            if (err) {
                                return callback(err);
                            } else {
                                db.sadd(this.plural, key);

                                // add index key for later
                                let fields = this.config.properties;
                                _.each(fields, (fieldConfig, field) => {
                                    if (typeof fieldConfig.index !== 'undefined' && fieldConfig.index && typeof data[field] !== 'undefined' && data[field] !== null) {
                                        let indexKey = this.createIndexKey(field, data[field]);
                                        db.sadd(indexKey, key);
                                    }
                                });


                                return callback(null, model);
                            }

                        });

                    }
                });
            }


        });


    }

    findOneByIndex(indexKey, callback) {

        if (!indexKey) {
            return callback(new Error("Index key is required."));
        }
        let db = this.db;

        db.smembers(indexKey, (err, members) => {
            if (err === null && members && members.length) {
                let memberKey = _.get(members, 0);
                db.hgetall(memberKey, (err, obj) => {
                    return callback(err, obj);
                });

            } else {
                return callback(err ? err : new Error("Model not found."));
            }

        })


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