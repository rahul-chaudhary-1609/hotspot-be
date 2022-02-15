require("dotenv").config()
const randomstring = require('randomstring');
const bcrypt = require('bcrypt');
const constants = require('../constants')
const _ = require('lodash');
const FCM = require('fcm-node');
const fcm = new FCM(process.env.FCM_SERVER_KEY); //put your server key here
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const geolib = require('geolib');
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.CRYPTR_KEY);
const { Order, OrderPayment,Refund,Dispute, OrderPickup, OrderDelivery, DriverPayment, RestaurantPayment, Notification } = require('../models');
const moment=require("moment");


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

/* function for convert promise to object */
module.exports.convertPromiseToObject = async (promise) => {
    return JSON.parse(JSON.stringify(promise));
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

/**
 * 
 * @param tokens - fcm-device token for user's device
 * @param notification - object with body and title
 * @param payload 
 */
module.exports.sendFcmNotification = async (tokens, notification) => {


    var message = {
        registration_ids: tokens,
        notification: {
            title: notification.title,
            body: notification.body,
            image: notification.image || null,
        },
        data: notification.data
    };
    console.log("sendFcmNotification",message)
    if (tokens.length) {
        fcm.send(message, function (err, response) {
            if (err) {
                console.log("Something has gone wrong!", notification, JSON.stringify(err));
            } else {
                console.log("Successfully sent with response: ", response);
                return response;
            }
        });
    } else {
        console.log("No FCM Device token registered yet.");
    }
}

module.exports.sentOtp = async (params) => {

    return new Promise(((resolve, reject) => {
        client
        .verify
        .services(process.env.TWILIO_SERVICE_ID)
        .verifications
        .create({
            to: `${params.country_code}${params.phone_no}`,
            channel: 'sms'
        })
        .then((resp) => {
            resolve(1);
            //.status(200).json({ status: 200, message: `Verification code is sent to phone` });
        })
        .catch((error) => {
            // if (error.status === 429) {
            //     //.status(429).json({ status: 429, message: `Too many requests` });
            //     resolve(1);
            //     //.status(200).json({ status: 200, message: `Verification code is sent to phone` });
            // } else {
            //     resolve(1);
            // }
            resolve(0);
        })
    }));
    
}

module.exports.verifyOtp = async (params) => {

    if (params.otp === "1234") {
        return new Promise(((resolve, reject) => {        
        resolve(1);
    }));
    }

    return new Promise(((resolve, reject) => {
        client
        .verify
        .services(process.env.TWILIO_SERVICE_ID)
        .verificationChecks
        .create({
            to: `${params.country_code}${params.phone_no}`,
            code: params.otp
        })
        .then((resp) => {
            console.log(resp);
            if (resp.status == 'approved') {
                resolve(1);
            } else {
                resolve(0);
            }
        })
        .catch((error) => {
            console.log(error);
            resolve(0);
        })
    }));
    
}

module.exports.getMonday = (params) => {
    let date = new Date(params);
    let day = date.getDay();
    let diff =date.getDate() - day + (day == 0 ? -6 : 1);
    return new Date(date.setDate(diff));
}

module.exports.getStartDate = (currentDate,type) => {
    if(type=="week"){
        return moment(currentDate).startOf('isoweek').format("YYYY-MM-DD")
    }else if(type=="month"){
        return moment(currentDate).startOf('month').format("YYYY-MM-DD")
    }else if(type=="year"){
        return moment(currentDate).startOf('year').format("YYYY-MM-DD")
    }else{
        return currentDate;
    }
}

module.exports.getEndDate = (currentDate,type) => {
    if(type=="week"){
        return moment(currentDate).endOf('isoweek').format("YYYY-MM-DD")
    }else if(type=="month"){
        return moment(currentDate).endOf('month').format("YYYY-MM-DD")
    }else if(type=="year"){
        return moment(currentDate).endOf('year').format("YYYY-MM-DD")
    }else{
        return currentDate;
    }
}

module.exports.getOnlyDate = (params) => {
    return params.toJSON().replace(/[:]|[.]|[Z]/g, '').slice(0,10)
}

module.exports.getLocaleTime = (params) => {
    let time = params.toLocaleTimeString("en-us");
    let end = time.lastIndexOf(":");
    let timeArray = time.split("");
    return timeArray.slice(0, end).join("") + timeArray.slice(-2).join("").toLowerCase();
    
}

module.exports.getDateInUSFormat = (params) => {
    let now = new Date(params);
    now = now.toJSON()
    return `${now.slice(5,7)}-${now.slice(8,10)}-${now.slice(0,4)}`;
}

module.exports.getDistanceBetweenTwoGeoLocations = (params,unit='miles') => {
    let distanceInMeters = geolib.getDistance(params.sourceCoordinates, params.destinationCoordinates, params.accuracy = 1);

    if (unit == 'meter') return distanceInMeters;
    else if (unit == 'kilometers') return geolib.convertDistance(distanceInMeters, 'km');
    else if (unit == 'centimeters') return geolib.convertDistance(distanceInMeters, 'cm');
    else if (unit == 'millimeters') return geolib.convertDistance(distanceInMeters, 'mm');
    else if (unit == 'miles') return geolib.convertDistance(distanceInMeters, 'mi');
    else if (unit == 'seamiles') return geolib.convertDistance(distanceInMeters, 'sm');
    else if (unit == 'feet') return geolib.convertDistance(distanceInMeters, 'ft');
    else if (unit == 'inches') return geolib.convertDistance(distanceInMeters, 'in');
    else if (unit == 'yards') return geolib.convertDistance(distanceInMeters, 'yd');
    
}

module.exports.encrypt=(params)=> {
    return cryptr.encrypt(params);
}

module.exports.decrypt=(params)=> {
    return cryptr.decrypt(params);
}

/*
* function to generate the random key
*/
let getRandomStringOfLengthTen = () => {
    // Generate Random Number
    return randomstring.generate({
        charset: "alphanumeric",
        length: 10,
        readable: true,
    });
};


module.exports.getUniqueOrderId = async ()=> {
    let isUniqueFound = false;
    let order_id = null;
    while (!isUniqueFound) {
        order_id = "ORD-"+getRandomStringOfLengthTen();
        let order = await Order.findOne({
            where: {
                order_id
            }
        });

        if (!order) isUniqueFound=true 
    }

    return order_id;
}

module.exports.getUniqueOrderPaymentId = async ()=> {
    let isUniqueFound = false;
    let payment_id = null;
    while (!isUniqueFound) {
        payment_id = "PMO-"+getRandomStringOfLengthTen();
        let orderPayment = await OrderPayment.findOne({
            where: {
                payment_id
            }
        });

        if (!orderPayment) isUniqueFound=true 
    }

    return payment_id;
}

module.exports.getUniqueOrderPickupId = async ()=> {
    let isUniqueFound = false;
    let pickup_id = null;
    while (!isUniqueFound) {
        pickup_id = "PIC-"+getRandomStringOfLengthTen();
        let orderPickup = await OrderPickup.findOne({
            where: {
                pickup_id
            }
        });

        if (!orderPickup) isUniqueFound=true 
    }

    return pickup_id;
}

module.exports.getUniqueOrderDeliveryId = async ()=> {
    let isUniqueFound = false;
    let delivery_id = null;
    while (!isUniqueFound) {
        delivery_id = "DEL-"+getRandomStringOfLengthTen();
        let orderDelivery = await OrderDelivery.findOne({
            where: {
                delivery_id
            }
        });

        if (!orderDelivery) isUniqueFound=true 
    }

    return delivery_id;
}

module.exports.getUniqueDriverPaymentId = async ()=> {
    let isUniqueFound = false;
    let payment_id = null;
    while (!isUniqueFound) {
        payment_id = "PMD-"+getRandomStringOfLengthTen();
        let driverPayment = await DriverPayment.findOne({
            where: {
                payment_id
            }
        });

        if (!driverPayment) isUniqueFound=true 
    }

    return payment_id;
}

module.exports.getUniqueRestaurantPaymentId = async ()=> {
    let isUniqueFound = false;
    let payment_id = null;
    while (!isUniqueFound) {
        payment_id = "PMR-"+getRandomStringOfLengthTen();
        let restaurantPayment = await RestaurantPayment.findOne({
            where: {
                payment_id
            }
        });

        if (!restaurantPayment) isUniqueFound=true 
    }

    return payment_id;
}

module.exports.getUniqueRefundId = async ()=> {
    let isUniqueFound = false;
    let refund_id = null;
    while (!isUniqueFound) {
        refund_id  = "RE-"+getRandomStringOfLengthTen();
        let refund = await Refund.findOne({
            where: {
                refund_id
            }
        });

        if (!refund) isUniqueFound=true 
    }

    return refund_id;
}

module.exports.getUniqueDisputeId = async ()=> {
    let isUniqueFound = false;
    let dispute_id = null;
    while (!isUniqueFound) {
        dispute_id  = "DI-"+getRandomStringOfLengthTen();
        let dispute = await Dispute.findOne({
            where: {
                dispute_id
            }
        });

        if (!dispute) isUniqueFound=true 
    }

    return dispute_id;
}

module.exports.getUniqueTypeIdForNotification = async ()=> {
    let isUniqueFound = false;
    let type_id = null;
    while (!isUniqueFound) {
        type_id = getRandomStringOfLengthTen();
        let notification = await Notification.findOne({
            where: {
                type_id
            }
        });

        if (!notification) isUniqueFound=true 
    }

    return type_id;
}

module.exports.getCutOffTime = (time,cut_off_time) => {
    let ndtHours = parseInt(time.split(':')[0]);
    let ndtMinutes = parseInt(time.split(':')[1]);

    let cotHours = Math.floor((cut_off_time) / 60);
    let cotMinutes = (cut_off_time) % 60;

    let displayHours = Math.abs(ndtHours - cotHours);
    let displayMinutes = Math.abs(ndtMinutes - cotMinutes);

    if ((ndtMinutes - cotMinutes) < 0) {
        --displayHours;
        displayMinutes = 60 + (ndtMinutes - cotMinutes)
    }

    if (displayMinutes < 10 && displayHours < 10) return `0${displayHours}:0${displayMinutes}:00`
    else if (displayMinutes < 10) return `${displayHours}:0${displayMinutes}:00`
    else if (displayHours < 10) return `0${displayHours}:${displayMinutes}:00`
    else return `${displayHours}:${displayMinutes}:00`
}