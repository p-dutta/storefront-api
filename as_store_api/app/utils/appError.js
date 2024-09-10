class AppError extends Error {
    constructor(message, statusCode, bodyStatusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode;
        this.status = "FAIL";
        this.isOperational = true;
        this.bodyStatusCode = bodyStatusCode || statusCode;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
