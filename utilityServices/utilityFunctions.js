const randomstring = require('randomstring');
const bcrypt = require('bcrypt');

module.exports.ReE =  (res, errMsg, code, errObj={}) => { // Error Web Response
    // if (typeof err == 'object' && typeof err.message != 'undefined') {
    //     err = err.message;
    // }
    if (typeof code !== 'undefined') res.statusCode = code;
    errObj = {
        ...errObj,
        message: errMsg
    }

    return res.json({ data: {}, success: false, message: errMsg, err: errObj, status_code: code });
};

module.exports.ReS =  (res, data, code, msg='Successfully completed') => { // Success Web Response
    let send_data = {};//{ success: true };

    if (typeof data == 'object') {
        send_data = Object.assign(data, send_data);//merge the objects
    }

    //if (typeof code !== 'undefined') res.statusCode = code;

    return res.json({ data: send_data, success: true, message: msg, status_code: code, err:{} })
};

module.exports.TE =  (err_message, log) => { // TE stands for Throw Error
    if (log === true) {
        console.error(err_message);
    }

    throw new Error(err_message);
};

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