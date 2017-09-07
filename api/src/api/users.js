import resource from 'resource-router-middleware';
import User from "../models/user";


export default ({app}) => resource({
    id: 'user',

    load(req, id, callback) {

        app.models.user.findById(id, (err, obj) => {
            return callback(err, obj);
        });

    },

    /** GET / - List all entities */
    index({params}, res) {

        user.findAll(null, (err, models) => {
            if (err) {
                return res.sendStatus(500).json(err);
            } else {
                return res.json(models);
            }
        });

    },

    /** POST / - Create a new entity */
    create({body}, res) {

        app.models.user.create(body, (err, obj) => {
            if (err) {
                return res.sendStatus(500).json(err);
            } else {
                return res.json(obj);
            }
        });


    },

    /** GET /:id - Return a given entity */
    read({model}, res) {

        console.log("get", model);

        res.json(model);
    },

    /** PUT /:id - Update a given entity */
    update({model, body}, res) {
        res.sendStatus(204);
    },

    /** DELETE /:id - Delete a given entity */
    delete({model}, res) {
        res.sendStatus(204);
    }
});
