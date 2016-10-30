'use strict';

const ServerModel = require('./server.model');
const PugModel = require('./pug.model');
const Promise = require('bluebird');
const _ = require('lodash');

var validationError = function(res, err) {
  return res.status(422).json(err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

  return Promise.all([ServerModel.find({}, {_id: 0, __v: 0}), PugModel.find({}, {_id: 0, __v: 0})])
  .spread((servers, pugs) => {
    pugs = _.sortBy(pugs, 'queue_name');
    return res.status(200).json({servers: servers, pugs: pugs});
  })
  .catch((err) => {
    validationError(res, err);
  });
};

exports.servers = function(req, res){
  const server = req.query.name;
  let query = {};

  if(server){
    query = {name: server};
  }

  ServerModel.find(query, {_id: 0, __v: 0})
  .then(function(servers){
    if(servers.length === 1){
      return res.status(200).json(servers[0]);
    }
    res.status(200).json(servers);
  })
  .catch(function(err){
    validationError(res, err);
  })
};

exports.pugs = function(req, res){
  const name = req.query.name;
  let query = {};

  if(name){
    query = {queue_name: name};
  }

  PugModel.find(query, {_id: 0, __v: 0})
  .then(function(pugs){
    if(pugs.length === 0){
      return res.status(400).json({success: false, message: 'No pug with that queue_name exists!'});
    } else if(pugs.length === 1){
      return res.status(200).json(pugs[0]);
    }
    res.status(200).json(pugs);
  })
  .catch(function(err){
    validationError(res, err);
  })
};