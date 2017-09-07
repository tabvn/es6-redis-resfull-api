import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import startApp from './server/database';
import middleware from './server/middleware';
import api from './server/api';
import config from './config.json';

let app = express();
app.server = http.createServer(app);

// logger
app.use(morgan('dev'));

// 3rd party middleware
app.use(cors({
    exposedHeaders: config.cors
}));

app.use(bodyParser.json({
    limit: config.bodyLimit
}));

// connect to db
startApp(db => {
    // internal middleware
    app.set("config", config);
    app.set('db', db);
    app.use(middleware(app));
    // api router
    app.use('/api', api(app));
    app.server.listen(process.env.PORT || config.port, () => {
        console.log(`App is running on port ${app.server.address().port}`);
    });
});

export default app;
