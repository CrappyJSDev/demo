'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');
var Users = require('../../api/user/user.model');
var app = require('../../app');
var io = app.io;
var SteamStrategy = require('passport-steam');

var router = express.Router();

router.get('/',
  passport.authenticate('steam'),
  function(req, res) {
    // The request will be redirected to Steam for authentication, so
    // this function will not be called.
  });

router.get('/return',
  passport.authenticate('steam', { failureRedirect: '/login', session: false }),
  auth.setTokenCookie);



module.exports = router;