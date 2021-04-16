
class ErrorHandler extends Error {
    constructor(statusCode, message) {
        super();
        this.statusCode = statusCode;
        this.message = message;
    }
}

const handleError = async (err, res) => {
    let { statusCode, message = 'internalServerError', errors = "" } = err;
    if (errors && errors.length && errors[0].type == "unique violation") {
        message = `${errors[0].path} is already used.`
        errors = ""
    }
    res.status(statusCode || 400).json({
        success: false,
        status: statusCode || 400,
        error: {
            err: errors,
            msg: message,
            stack: err.stack,
            errorCode: statusCode || 400
        },
        time: Date.now()
    });
};

const sendResponse = async (res, message, data, status = 200) => {
    // response
    res.status(200).json({
        success: true,
        status: status,
        message: message,
        body: data || {},
        time: Date.now()
    });
}
module.exports = {
    ErrorHandler,
    handleError,
    sendResponse
}