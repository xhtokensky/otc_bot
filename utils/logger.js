"use strict";

let log4js = require('log4js');
log4js.configure({
    appenders: [
        {
            type: 'console',
            category: 'console'
        }, //控制台输出
        {
            type: 'file', //文件输出
            filename: './logs/error.log',
            maxLogSize: 1024000,
            backups: 3,
            category: 'error'
        }
    ],
    replaceConsole: true
});


exports.getLogger = function (name) {
    return log4js.getLogger(name);
};

exports.LEVEL = {
    ALL: "ALL",
    TRACE: "TRACE",
    DEBUG: "DEBUG",
    INFO: "INFO",
    WARN: "WARN",
    ERROR: "ERROR",
    FATAL: "FATAL",
    MARK: "MARK",
    OFF: "OFF"
};
