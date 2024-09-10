const winston = require('winston');
require("winston-daily-rotate-file");

const logger = (logFileName) => {
    const levels = {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        debug: 4,
    }
    const level = () => {
        const env = process.env.NODE_ENV || 'development'
        const isDevelopment = env === 'development'
        return isDevelopment ? 'debug' : 'warn'
    }
    const colors = {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        http: 'magenta',
        debug: 'white',
    }
    winston.addColors(colors)
    const format = winston.format.combine(
        //winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        /*winston.format.printf(
            (info) => `[${info.timestamp}] ${info.level}: ${info.message}`,
        ),*/
        /*winston.format.printf((info) => {
            const metaString = info.meta ? JSON.stringify(info.meta) : '';
            return  `[${info.timestamp}] ${info.level}: ${info.message} ${metaString}`;
        }),*/
        winston.format.json(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf((info) => {
            return  `[${info.timestamp}] ${JSON.stringify(info)}`;
        }),
    )

    /*const transports = [
        new winston.transports.Console({
            format: winston.format.colorize({ all: true })
        })
    ];*/

    const transports = [];

    if (logFileName !== undefined) {
        transports.push(
            new winston.transports.DailyRotateFile({
                filename: `logs/${logFileName}_%DATE%.log`,
                datePattern: "YYYY-MM-DD",
                maxFiles: "7d",
            })
        )
    } else {
        transports.push(
            new winston.transports.DailyRotateFile({
                filename: "logs/%DATE%.log",
                datePattern: "YYYY-MM-DD",
                maxFiles: "7d",
            })
        )
    }

    /*return winston.createLogger({
        level: level(),
        levels,
        format,
        transports
    });*/

    const asyncLogger = winston.createLogger({
        level: level(),
        levels,
        format,
        transports,
    });

    async function asyncLog(level, message, meta) {
        setImmediate(() => {
            asyncLogger.log(level, message, meta);
        });
    }

    return {
        log: async (level, message, meta) => {
            await asyncLog(level, message, meta);
        },
        levels,
    };



}
module.exports = logger;