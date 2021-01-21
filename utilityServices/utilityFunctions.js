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