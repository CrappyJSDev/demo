'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const Promise = require('bluebird');
var crypto = require('crypto');

mongoose.Promise = Promise;


var UserSchema = new Schema({
  steamid: { type: String, index: true },
  steam: {},
  role: { type: String},
  friended: { type: Boolean, default: false },
  notifications: {type: Boolean, default: false, index: true },
  notifyArray: {type: Object, default: { LCTF: false, Base: false, LCTFEU: false } },
  lastNotified: Number,
  notificationTimer: {type: Number, default: 25 }
});


module.exports = mongoose.model('User', UserSchema);
