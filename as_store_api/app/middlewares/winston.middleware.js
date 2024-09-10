const logger = require("../utils/logger");

const loggingMiddleware = async (req, res, next) => {
    // logger('filename').info(`Request received: ${req.method} ${req.url}`);
    /*const metadata = { some: 'additional', data: 'here' };
    logger.info({ 'Some log message', metadata });*/
    console.log(req.url);
    try {
        await logger("misc").log("info", `Request received: ${req.method} ${req.url}`, {"meta": req.body});
        /*const timeNow = new Date();
        console.log(timeNow.getSeconds(), timeNow.getMilliseconds());
        console.log("promise er pore");*/
    } catch (e) {
        console.log(e);
    }
    next();
}


module.exports = loggingMiddleware;