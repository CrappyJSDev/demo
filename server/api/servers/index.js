'use strict';

var express = require('express');
var controller = require('./server.controller');

var router = express.Router();

router.get('/stats', controller.index);
router.get('/servers', controller.servers);
router.get('/pugs', controller.pugs);

module.exports = router;
