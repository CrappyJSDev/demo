'use strict';

const logger = require('./logger');
const UserModel = require('../api/user/user.model');

const moment = require('moment');
const Promise = require('bluebird');
const time = require("time-since");

function checkNotifications(name, count){
    //if(!steam.client){
        var steam = require('./steam');
    //}

        UserModel.find({notifications: true})
        .then((users) => {
            const shouldBeNotified = users.map((user) => {

                const keys = Object.keys(user.notifyArray);
                const timeNow = moment().unix();
                let func = null;
  
                func = keys.forEach((key, i) => {
                    if(key === name){
                        if(!user.notifyArray[key]){
                            return func;
                        }


                        const epoch = new Date(0);
                        epoch.setUTCSeconds(user.lastNotified);

                        const timeSince = time.since(epoch).mins();

                        if(timeSince >= user.notificationTimer && count >= user.notifyArray[key] || !timeSince){
                                steam.sendMessage(user.steamid, name + ' has reached a total of ' + count + ' players.');
                                user.lastNotified = moment().unix();
                                func = user.save();
                        }                    
                    }
                });
                return func;
            });

            return shouldBeNotified;
        });
    };

function checkNameExists(name){
    if(name === "Base" || name === "LCTF" || name === "LCTFEU" || name === "Branzone - Chi2 - Organized PUGs" || name === "Branzone - Sydney" || name === "Branzone - LA - Casual" || name === "Branzone - Dallas - LCTF" ||
    name === "Branzone - Dallas - LCTF" || name === "Branzone - Chi - CTF" || name === "Branzone - NY1 - CTF" || name === "Branzone - NY2 - LCTF" || name === "Branzone - NY3 - Organized PUGs" ||
    name === "Branzone - EU1 - Casual" || name === "Branzone - EU2 - Organized PUGs" || name === 'all'){
        return true;
    }

    return false;
}

module.exports = {
    checkNotifications: checkNotifications,
    checkNameExists: checkNameExists
}