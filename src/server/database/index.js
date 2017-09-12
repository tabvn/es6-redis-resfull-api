import redis from 'redis';
import config from '../../config.json';

let client = redis.createClient(config.db);
export default callback => {
    // connect to a database if needed, then pass it to `callback`:
    client.on('connect', function () {
        console.log('Connected to redis database.');
    });

    return callback(client);

}
