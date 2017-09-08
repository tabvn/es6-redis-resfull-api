import user from './common/models/user.json'
import User from "./common/models/user";


export default class Models {

    constructor(app) {

        this.models = {
            user: {
                config: user,
                model: new User(app)
            },
            // Add more model here.
        };

        this.getModels = this.getModels.bind(this);
    }

    getModels() {
        return this.models;
    }
}