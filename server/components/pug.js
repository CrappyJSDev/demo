'use strict';

const request = require('request-promise');
const Promise = require('bluebird');
const moment = require('moment');
const EventEmitter = require('events').EventEmitter;

const PugModel = require('../api/servers/pug.model');
const helpers = require('./helpers');

const pugUrl = 'http://pug.xzanth.com/api/queue_list';

class Pug extends EventEmitter {
  constructor(props){
    super();

    this.pugList;

    this.on('gotPugs', this.sortPugs.bind(this));
  };

  getPugs(){
    request.get(pugUrl)
    .then((pugs) => {

      pugs = JSON.parse(pugs);

      pugs.checked_time =  moment().unix();
      this.pugList = pugs;

      this.emit('gotPugs');
    })
    .catch((err) => {
      console.log(err);
    });
  };

  sortPugs(){
    this.pugList.forEach((pug) => {
      this.savePug(pug);
    });
  };

  savePug(pug){
    PugModel.findOne({queue_name: pug.queue_name})
    .then((pugModel) => {
      let currentTime = moment().unix();

      if(!pugModel){

        let newModel = new PugModel(pug);

        let saved = newModel.save();

        return saved;
           
      } else {

        pugModel.current_players = pug.current_players;
        pugModel.players = pug.players;
        pugModel.checked_time = currentTime;
        pugModel.games = pug.games;

        let saved = pugModel.save();

        this.emit('savedPug');

        return saved;
      }      
    })
    .then(() => {
      return helpers.checkNotifications(pug.queue_name, pug.current_players);
    });
  };

}

module.exports = new Pug();