'use strict';

const messages = {

    help: [
        "!help - List all commands",
        "!servers - List all servers and players on those servers",
        //"!notify (QUEUE/SERVER) (PLAYER COUNT) - you will be sent a notification via steam when the queue or server reaches the player count, QUEUE/SERVER must be wraped in quotation marks",
        //'!disable (QUEUE/SERVER) - disables the notification for the specified queue or server. Use "all" to remove all notifications',
        //'!settimer (MINUTES) - Allows you to set the frequency of notifications',
        "!pug (QUEUE) - Get the status of the default or specified pug",
        "!ts3 - Get the ts3 info",
        //"!version - Get the version number of pugbot"
    ],

    status: function(statusObj){
        return statusObj.queue_name + ' - [' + statusObj.current_players + '/' + statusObj.max_players + ']: ' + statusObj.players; 
    },

    version: "Currently running pugbot version: 0.2.9",

}

module.exports = messages;