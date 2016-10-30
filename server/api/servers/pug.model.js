'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const Promise = require('bluebird');
var crypto = require('crypto');

mongoose.Promise = Promise;


var PugSchema = new Schema({
  queue_name: String,
  current_players: Number,
  max_players: Number,
  players: { type: Array },
  games: { type: Array },
  checked_time: Number
});


module.exports = mongoose.model('Pug', PugSchema);
