'use strict';

const Discord = require('discord.js');
const SteamUser = require('steam-user');
const Promise = require('bluebird');
const EventEmitter = require('events').EventEmitter;

const ServerModel = require('../api/servers/server.model');
const UserModel = require('../api/user/user.model');
const PugModel = require('../api/servers/pug.model');
const chatMessages = require('./chatMessages');
const helpers = require('./helpers');
const logger = require('./logger');


class discord extends EventEmitter{
    constructor(props){
        super();

        this.client = new Discord.Client();
        this.mainChannel = '231050003500498945';

        this.client.on('message', this.onMessage.bind(this));
        this.on('ready', this.join.bind(this));
    };

    login(){
         this.client.loginWithToken('MjMyOTUzMjcyMzAwNzMyNDI2.CtWf7w.kf1_vBrcX39cwqqrA7-cXlUyhcg', (err, loggedIn) => {
             this.emit('ready');
             var channel = this.client.channels.get("Midair AUS/NZ");
            //console.log(this.client);
         });
    };

    join(){
        //console.log(client)
    };

    onMessage(msg){
        let func = null;
        if(msg.content === '!help'){
            func = chatMessages.help.forEach((message) => {
                return this.sendMessage(message);
            });            
        } else if(msg.content === "!servers"){
           this.sendServers();
            /*.then((servers) => {
                console.log(servers);
                return servers.forEach((server) => {
                    const str = server.name + ' - [' + server.players + ']';
                    console.log(str)
                    return this.sendMessage(str);
                });
            }));*/       
        } else if(msg.content === "!pugs"){
            let queue_name = msg.content.slice(5);

            if(queue_name.length === 0){
                queue_name = 'LCTF';
            }
            func = (PugModel.findOne({queue_name: queue_name})
            .then((pug) => {
                let message = 'Queue not found.';

                if(pug){
                    message = chatMessages.status(pug);
                }

                return this.sendMessage(message);
            }));            
        } else if (msg.content === '!who eats dick'){
            this.client.sendMessage(this.mainChannel, 'Jazzy does bru');
        }

        console.log(func)
        return func();
    };

    sendMessage(msg){
        console.log(msg);
        this.client.sendMessage(this.mainChannel, msg);
    };

    sendServers(){
        ServerModel.find({}, {_id: 0, __v: 0}, (err, servers) => {
            console.log(err, servers);
            servers.forEach((server) => {
                const str = server.name + ' - [' + server.players + ']';
                return this.sendMessage(str);
            }); 
        });
    };


};

var newD = new discord();
newD.login();
//newD.join();