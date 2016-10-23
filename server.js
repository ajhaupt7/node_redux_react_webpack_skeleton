var hapi = require('hapi');
var pkg = require('./package.json');

var PORT = process.env.PORT || 8000;
var server = new hapi.Server();

var plugins = [
  require('h2o2'),
  require('inert'),
  require('vision'),
  require('blipp')
];

server.register(plugins, function() {
  server.connection({ port: PORT });

  server.route({
    method: 'GET',
    path: '/{p*}',
    handler: {
      file:'./public/index.html'
    }
  });

  server.route({
    method: 'GET',
    path: '/static/{p*}',
    handler: {
      directory: {
        path: './static',
        listing: false,
        index: true
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/static/assets/{p*}',
    handler: {
      directory: {
        path: './static/assets',
        listing: false,
        index: true
      }
    }
  });

  // Start your Server
  server.start((err) => {
    if (err) {
      throw err;
    }
    console.log('Server running at:', server.info.uri);
  });
});

module.exports = server;
