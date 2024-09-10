class ApiSuccessResponse {
    constructor(message, statusCode, data) {
        this.message = message;
        this.statusCode = statusCode;
        this.data = data;
    }

    sendResponse = (res, http_status) => {
        res.status(this.statusCode).json({
            status: "SUCCESS",
            status_code: http_status !== undefined ? http_status : this.statusCode,
            message: this.message,
            data: this.data ? this.data : {}
        });
    }

}

module.exports = ApiSuccessResponse;
