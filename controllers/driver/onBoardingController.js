const utilityFunction = require('../../utils/utilityFunctions');
const constants = require("../../constants");
const { ErrorHandler, handleError, sendResponse } = require('../../utils/handler');
const { OnBoradinServices } = require("../../services/driver/onBorardingServices");

const onBoradingServices = new OnBoradinServices(); 

class OnBoardingController {
    constructor() { }

    /*
    * function for login
    * @req :  phone, password
    */
    login = async (req, res, next) => {
        try {
            const loginData = await onBoradingServices.login(req.body);
            return sendResponse(res, constants.MESSAGES.success, loginData);
        } catch (e) {
            next(e);
        }
    }

    /*
    * function for forgot_password
    * @req :  phone
    */
    forgot_password = async (req, res, next) => {
        try {
            const forgotPasswordRes = await onBoradingServices.forgot_password(req.body);
            return sendResponse(res, constants.MESSAGES.success, forgotPasswordRes);
        } catch (e) {
            next(e);
        }
    }

     /*
    * function for verify otp
    * @req :  phone, otp
    */
    verify_otp = async (req, res, next) => {
        try {
            const forgotPasswordRes = await onBoradingServices.verify_otp(req.body);
            return sendResponse(res, constants.MESSAGES.success, forgotPasswordRes);
        } catch (e) {
            next(e);
        }
    }

    /*
    * function for change password
    * @req :  password
    */
    change_password = async (req, res, next) => {
        try {
            const forgotPasswordRes = await onBoradingServices.change_password(req.body, req.user);
            return sendResponse(res, constants.MESSAGES.success, forgotPasswordRes);
        } catch (e) {
            next(e);
        }
    }

    /*
    * function for sign up step 1
    * @req :  password
    */
    sign_up_step1 = async (req, res, next) => {
        try {
            const forgotPasswordRes = await onBoradingServices.sign_up_step1(req.body);
            return sendResponse(res, constants.MESSAGES.success, forgotPasswordRes);
        } catch (e) {
            next(e);
        }
    }

    /*
    * function for sign up details step 1
    * @req :  password
    */
    sign_up_details_step1 = async (req, res, next) => {
        try {
            const responseData = await onBoradingServices.sign_up_details_step1(req.body, req.user);
            return sendResponse(res, constants.MESSAGES.success, responseData);
        } catch (e) {
            next(e);
        }
    }


    /*
    * function for sign up details step 2
    * @req :  password
    */
    sign_up_details_step2 = async (req, res, next) => {
        try {
            const responseData = await onBoradingServices.sign_up_details_step2(req.body, req.user);
            return sendResponse(res, constants.MESSAGES.success, responseData);
        } catch (e) {
            next(e);
        }
    }

    /*
        * function for sign up details step 3
        * @req :  password
        */
    sign_up_details_step3 = async (req, res, next) => {
        try {
            const responseData = await onBoradingServices.sign_up_details_step3(req.body, req.user);
            return sendResponse(res, constants.MESSAGES.success, responseData);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = { OnBoardingController }