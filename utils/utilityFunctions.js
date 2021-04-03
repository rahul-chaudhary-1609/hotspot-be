const randomstring = require('randomstring');
const bcrypt = require('bcrypt');
const constants = require('../constants')
const _ = require('lodash');


/* function for sending the error response */
module.exports.errorResponse = (res, error, errorCode, message = constants.MESSAGES.bad_request) => {
    //let response = { ...constants.defaultServerResponse };

    let response = {
        success : false,
        message : message,
        status : errorCode,
    }

    if (!_.isEmpty(error.message)) {
        if (error.message == 'SequelizeUniqueConstraintError: Validation error') {
            response.message = constants.MESSAGES.duplicate_value;
        } else {
            response.message = error.message;
        }
    } else {
        response.message = message;
    }

    return res.status(response.status).json(response);
};

/* function for sending the success response */
module.exports.successResponse = (res, params, message) => {
    //let response = { ...constants.defaultServerResponse };
    let response = {
        success: true,
        message : message,
        status : 200,
    };
    
    return res.status(response.status).json({ ...response ,...params});
}
    
module.exports.TE =  (err_message, log) => { // TE stands for Throw Error
    if (log === true) {
        console.error(err_message);
    }

    throw new Error(err_message);
};

module.exports.convertPromiseToObject = async (promise) => {
    return JSON.parse(JSON.stringify(promise));
}

module.exports.gererateOtp = () => {
    // Generate Random Number
    const otp = randomstring.generate({
        charset: 'numeric',
        length: 4,
        numeric: true,
        letters: false,
        special: false,
        exclude: ["0"],
    });
    return process.env.DEFAULT_OTP == "true" ? '1234' : otp;
};

/*
* function to get the time
*/
module.exports.calcluateOtpTime = (date) => {
    var d = new Date(date);
    var t = d.getTime();
    return Math.floor(t);
}

/*
*get the current time value
*/
module.exports.currentUnixTimeStamp = () => {
    return Math.floor(Date.now());
}

/*
*get the current time value
*/
module.exports.getUnixTimeStamp = (date, n) => {
    var d = new Date(date);
    return d.getTime() + n*60000;
}


/* function for bcrypt the password */
module.exports.bcryptPassword = async (myPlaintextPassword) => {
    return bcrypt.hash(myPlaintextPassword, 10);
}

/* function for compare the passwords */
module.exports.comparePassword = async (myPlaintextPassword, hash) => {
    return bcrypt.compare(myPlaintextPassword, hash);
}

module.exports.pagination = async (page, page_size) => {
    if (page_size) {
        page_size = Number(page_size)
    } else {
        page_size = 10
    }
    if (page) {
        page = ((Number(page) - 1) * Number(page_size))
    } else {
        page = 0
    }
    return [page, page_size];
}