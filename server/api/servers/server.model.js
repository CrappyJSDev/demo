'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const Promise = require('bluebird');
var crypto = require('crypto');

mongoose.Promise = Promise;


var ServerSchema = new Schema({
  name: String,
  ip: String,
  port: Number,
  players: { type: Number, default: 0 },
  checked_time: Number
});


module.exports = mongoose.model('Server', ServerSchema);
