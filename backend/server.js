const Hapi = require('hapi');
const bcrypt = require('bcrypt');
const basicAuth = require('hapi-auth-basic');
const users = require('./config/users.js');
const routes = require('./config/routes.js');

const server = new Hapi.Server();
server.connection({
    port: 9001,
    routes: {
        cors: {
            origin: ['*'],
        },
    },
});

const validate = (request, username, password, callback) => {
    const user = users[username];
    if (!user) {
        return callback(null, false);
    }
    else {
        bcrypt.compare(password, user.password, (err, isValid) => {
            callback(err, isValid, {
                id: user.id,
                name: user.name,
            });
        });
    }
}

server.register(basicAuth, (err) => {
    if (err) {
        console.log(err);
    }
    else {
        server.auth.strategy('simple', 'basic', {
            validateFunc: validate,
        });
        server.route(routes);
    }
});

server.start((err) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log('server running at: ', server.info.uri);
    }
});