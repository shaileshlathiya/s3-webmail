const Hapi = require('hapi');
const bcrypt = require('bcrypt');
const basicAuth = require('hapi-auth-basic');
const inert = require('inert'); // for file downloads
const users = require('./config/users.js');
const routes = require('./config/routes.js');
const {
    ConnectToMailbox,
    DisconnectFromMailbox,
} = require('./config/MailModel.js');

const server = new Hapi.Server({
  connections: {
    routes: {
      cors: true,
      files: {
        relativeTo: __dirname,
      },
    },
  },
});
server.connection({
    port: 9001,
});
server.register(inert, () => {});

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
        ConnectToMailbox('test');
        console.log('server running at: ', server.info.uri);
    }
});

process.on('SIGINT', function() { // if process ends
  DisconnectFromMailbox();
  server.stop();
});
