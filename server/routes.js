/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var path = require('path');

const steam = require('./components/steam');
const pug = require('./components/pug');
const ServerModel = require('./api/servers/server.model');

setInterval(() => {
  steam.getServerList();
}, 60000);

setInterval(() => {
  pug.getPugs();
}, 180000);


module.exports = function(app) {

  // Insert routes below
  app.use('/api', require('./api/servers'));
  app.use('/api/users', require('./api/user'));
  app.get('/api/games/playercountau', function(req, res, next){
    ServerModel.findOne({name: 'Branzone - Sydney'})
    .then(function(server){
      res.status(200).json(server);
    })
    .catch(function(err){
      res.status(400).send("Fuck Bittah!");
    });
  })

  app.use('/auth', require('./auth'));
  
  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });
};
