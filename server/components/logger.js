var winston = require('winston');

var transportConsole = new winston.transports.Console({ json: false, timestamp: true, prettyPrint:true, colorize: true, level:'error' });
var transportFileException = new winston.transports.File({ filename: './server/logs/exception.log', json: false });

var logger = new (winston.Logger)({
    levels: {
        info: 0,
        warn: 1,
        express: 2,
        error: 3,
    },
    transports: [
        transportConsole,
        new ( winston.transports.File)({
            name: 'info-file',
            filename: './server/logs/info.log',
            level: 'info'
        }),
        new (  winston.transports.File )({
            name: 'warn-file',
            filename: './server/logs/warn.log',
            level: 'warn'
        }),
        new ( winston.transports.File )({
            name: 'express-file',
            filename: './server/logs/express.log',
            level: 'express'
        }),
        new (  winston.transports.File )({
            name: 'error-file',
            filename: './server/logs/error.log',
            level: 'error'
        })
    ],
    exceptionHandlers: [
        transportConsole,
        transportFileException,
    ],
    exitOnError: false
});

winston.addColors({
    info: 'green',
    warn: 'cyan',
    express: 'blue',
    error: 'red',
});

logger.stream = {
    write: function(message, encoding){
        logger.express(message);
    }
};

module.exports = logger;