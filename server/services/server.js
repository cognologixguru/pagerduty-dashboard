var express = require('express');
var app = express();
var server = require('http').createServer(app);
var sockets = require('socket.io')();
var hash = require('crypto').createHash;
var path = require('path');

var buildGroups = require('./groups');
var dataProvider;
var subdomain;
var dataPackageCache;

// start the server, including static assets and socket endpoints
module.exports = function (provider, domain, port, base) {
  dataProvider = provider; // could be the API or the mock data
  subdomain = domain;

  base = base.replace(/\/$/, ''); // remove trailing slashes from the base

  // serve all the static files (generated by gulp)
  app.use(base, express.static(path.join(__dirname, '..', '..', 'public_html')));

  // serve the socket.io library and setup the endpoint
  sockets.path((base === '/' ? '' : base) + '/socket.io');
  sockets.attach(server);

  // start the server
  server.listen(port, function () {
    console.log('Server available at localhost:%d%s', port, base);
  });

  // once a client connects, send them the data if it's ready
  sockets.on('connection', function (socket) {
    if (dataPackageCache) {
      sendUpdate(dataPackageCache);
    }
  });

  return {
    updateStatus: updateStatus
  };
};

// get the services from the API and send it to the client
function updateStatus () {
  get('services', function (services) {
    dataPackageCache = makeUpdatePackage(services);
    console.log('%s: Sending update.', new Date());
    sendUpdate(dataPackageCache);
  });
}

// wrapper around API to send any server error messages to the client
function get (resource, callback, params) {
  dataProvider.getAll(resource, function (error, data) {
    if (error) {
      return sendError(error);
    }
    callback(data);
  }, params);
}

// given API services, group and hash them (to avoid unnecessary client redraws)
// note: always send the data (changes or not) to let the client know that the server is up
function makeUpdatePackage (services) {
  var groups = buildGroups(services, subdomain);
  return {
    groups: groups,
    hash: hash('sha256').update(JSON.stringify(groups)).digest('hex')
  };
}

function sendUpdate (updatePackage) {
  sockets.emit('update', updatePackage);
}

function sendError (error) {
  console.log('%s: %s', new Date(), error.message);
  sockets.emit('error', error.message);
}
