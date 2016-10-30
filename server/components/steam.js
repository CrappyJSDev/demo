'use strict';

const SteamUser = require('steam-user');
const Promise = require('bluebird');
const moment = require('moment');
const EventEmitter = require('events').EventEmitter;

const ServerModel = require('../api/servers/server.model');
const UserModel = require('../api/user/user.model');
const PugModel = require('../api/servers/pug.model');
const chatMessages = require('./chatMessages');
const Discord = require('./discord');
const helpers = require('./helpers');
const logger = require('./logger');


class Steam extends EventEmitter{
    constructor(props){
        super();

        this.client = new SteamUser();

        this.logOn();
        this.client.on('loggedOn', this.loggedOn.bind(this));
        this.client.on('friendMessage', this.friendMessage.bind(this));
    };

    logOn(){
        this.client.logOn({
            accountName: 'steammarketalerts',
            password: 'Diescumd1e'
        });
    };

    loggedOn(){
        this.emit('loggedOn');
        this.client.setPersona(SteamUser.EPersonaState.Online);
        logger.info('logged into steam');

        this.getServerList();
    };

    checkForFriend(steamid){
        const friend = this.client.myFriends[steamid];

        if(friend){
            if(friend === 3){
                return true;
            }
        }
        return false;
    }

    //gets the list of servers (detailed)
    getServerList(){
        const midair = String('\\appid\\439370');
        let tempArr = [];

        this.client.getServerList(midair, 3000, (servers) => {
            for(let i in servers){
              console.log(servers[i])
                let nameArr = servers[i].addr.split(':');

                let obj = {
                    ip: nameArr[0],
                    port: nameArr[1],
                    name: servers[i].name,
                    players: servers[i].players,
                    checked_time: moment().unix()
                };
                tempArr.push(obj);
            }

            tempArr.forEach((server) => {
                if(typeof(server.players) !== 'number') return;
                return this.saveServers(server);
            });
        });
    }


    // Adds a steam friend
    // @ steamid - string - steam64
    addFriend(steamid){
        this.client.addFriend(steamid);
    };

    // run when we recieve a message from a friend
    // sender - steamid getSteam3RenderedID()
    // message
    friendMessage(sender, message){
        UserModel.findOne({steamid: sender.getSteamID64()})
        .then((user) => {
            let func = null;
            let userModel = user;

            if(!user){
                const newUser = new UserModel({
                    steamid: sender.getSteamID64(),
                    notifyArray: {},
                    friended: true
                });

                userModel = newUser;
                func = newUser.save();
            }
            return [func, userModel];
        })
        .spread((saved, user) => {
            return this.pugBotMessage(sender.getSteamID64(), message);
        })
        .catch((err) => {
            logger.error(err);
        });
    };

    // sends a message
    // steamid - the steamid to send to
    // message 
    sendMessage(steamid, message){
        this.client.chatMessage(steamid, message);
    };

    // check if a message we recieved is for the pugbot
    pugBotMessage(steamid, message){
        const self = this;
        let func = null;

        return new Promise(function(resolve, reject){
            if(message === '!help'){
                func = chatMessages.help.forEach((message) => {
                    return self.sendMessage(steamid, message);
                });
            } else if (message === '!version'){
                func = selfthis.sendMessage(steamid, chatMessages.version);
            } else if (message === '!servers'){
                func = (ServerModel.find({}, {_id: 0, __v: 0})
                .then((servers) => {
                    return servers.forEach((server) => {
                        const str = server.name + ' - [' + server.players + ']';
                        return self.sendMessage(steamid, str);
                    });
                }));
            } else if (message.slice(0, 4) === '!pug'){
                let queue_name = message.slice(5);

                if(queue_name.length === 0){
                    queue_name = 'LCTF';
                }
                func = (PugModel.findOne({queue_name: queue_name})
                .then((pug) => {
                    let message = 'Queue not found.';

                    if(pug){
                        message = chatMessages.status(pug);
                    }

                   return self.sendMessage(steamid, message);
                }));
            } else if (message.slice(0, 8) === '!disable'){
                const notifyArr = message.split('"');

                const name = notifyArr[1];

                logger.info(name)

                if(!helpers.checkNameExists(name)){
                    return func = self.sendMessage(steamid, 'Sorry that is not a valid server or pug queue name. Make sure you have the name wrapped in quotes');
                }

                func = (UserModel.findOne({steamid: steamid})
                .then(function(user){

                    const obj = {
                        notifications: true,
                        notifyArray: user.notifyArray
                    };
                    
                    if(name === 'all'){
                        const keys = Object.keys(obj.notifyArray);

                        keys.forEach(function(key){
                            obj.notifyArray[key] = false;
                        });
                    } else {
                        obj.notifyArray[name] = false;
                    }

                    return UserModel.update({steamid: steamid}, obj, {upsert: true});
                })
                .then(() => {
                    logger.info(steamid + ' has removed a notification for ' + name);
                    return self.sendMessage(steamid, 'You will no longer receive alerts for ' + name);
                }));
            } else if (message.slice(0, 9) === '!settimer') {
                let newTimer = message.slice(10);

                func = UserModel.findOne({steamid: steamid})
                .then((user) => {
                    user.notificationTimer = newTimer;
                    return user.save();
                })
                .then(() => {
                    return self.sendMessage(steamid, 'You will now receive notifications every ' + newTimer + ' minutes!');
                });
                
            } else if (message.slice(0, 7) === '!notify'){
                const notifyArr = message.split('"');

                if(notifyArr.length !== 3){
                   return func = self.sendMessage(steamid, 'Sorry that is not a valid server or pug queue name. Make sure you have the name wrapped in quotes'); 
                }

                const name = notifyArr[1];
                const count = notifyArr[2].substring(1);

                if(!helpers.checkNameExists(name)){
                    return func = self.sendMessage(steamid, 'Sorry that is not a valid server or pug queue name. Make sure you have the name wrapped in quotes');
                } else if(count === 0){
                    return func;
                }

                func = (UserModel.findOne({steamid: steamid})
                .then((user) => {

                    const obj = {
                        notifications: true,
                        notifyArray: user.notifyArray
                    };

                    obj.notifyArray[name] = count;

                    return UserModel.update({steamid: steamid}, obj, {upsert: true})               
                })
                .then(() => {
                    logger.info(steamid + ' has set a notification for ' + name + ' at ' + count + ' players');
                    return self.sendMessage(steamid, 'You will be sent an alert when ' + name + ' reaches ' + count + ' players.');
                }));
            }
        });

        return func;
    };

    saveServers(server){
        ServerModel.findOne({ip: server.ip})
        .then((model) => {
            let saved = null;

            if(!model){
                let newModel = new ServerModel(server);
                saved = newModel.save();
            } else {
                model.players = server.players;

                saved = model.save();
            }

            return saved;
            
        })
        .then(() => {
            return helpers.checkNotifications(server.name, server.players);
        })
        .catch(function(err){
            logger.error(err);
        });
    };

};

module.exports = new Steam();
