const utilityFunction = require('../../utils/utilityFunctions');
const constants = require("../../constants");
const { ErrorHandler, handleError, sendResponse } = require('../../utils/handler');
const onBoardingServices  = require("../../services/driver/onBorardingServices");

module.exports = {
        /*
    * function for login
    * @req :  phone, password
    */
   login:async (req, res) => {
    try {
        const loginData = await onBoardingServices.login(req.body);
        utilityFunction.successResponse(res, loginData, constants.MESSAGES.success);
    } catch (error) {
        utilityFunction.errorResponse(res, error, constants.code.error_code);
    }
   },


       /*
    * function for forgot_password
    * @req :  phone
    */
   forgotPassword:async (req, res) => {
    try {
        const forgotPasswordRes = await onBoardingServices.forgotPassword(req.body);
        utilityFunction.successResponse(res, forgotPasswordRes, constants.MESSAGES.success);
    } catch (error) {
        utilityFunction.errorResponse(res, error, constants.code.error_code);
    }
   },

        /*
    * function for verify otp
    * @req :  phone, otp
    */
   verifyOTP:async (req, res) => {
    try {
        const forgotPasswordRes = await onBoardingServices.verifyOTP(req.body);
        utilityFunction.successResponse(res, forgotPasswordRes, constants.MESSAGES.success);
    } catch (error) {
        utilityFunction.errorResponse(res, error, constants.code.error_code);
    }
    },
   
   /*
    * function for reset password
    * @req :  phone, new password
    */
   resetPassword:async (req, res) => {
        try {
            const responseFromService = await onBoardingServices.resetPassword(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.password_change_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

       /*
    * function for sign up step 1
    * @req :  password
    */
   signUpStep1:async (req, res) => {
    try {
        const forgotPasswordRes = await onBoardingServices.signUpStep1(req.body);
        utilityFunction.successResponse(res, forgotPasswordRes, constants.MESSAGES.success);
    } catch (error) {
        utilityFunction.errorResponse(res, error, constants.code.error_code);
    }
   },


    /*
    * function for sign up details step 1
    * @req :  password
    */
   signUpDetailsStep1:async (req, res) => {
    try {
        const responseData = await onBoardingServices.signUpDetailsStep1(req.body, req.user);
        utilityFunction.successResponse(res, responseData, constants.MESSAGES.success);
    } catch (error) {
        utilityFunction.errorResponse(res, error, constants.code.error_code);
    }
   },

       /*
    * function for sign up details step 2
    * @req :  password
    */
   signUpDetailsStep2:async (req, res) => {
    try {
        const responseData = await onBoardingServices.signUpDetailsStep2(req.body, req.user);
        utilityFunction.successResponse(res, responseData, constants.MESSAGES.success);
    } catch (error) {
        utilityFunction.errorResponse(res, error, constants.code.error_code);
    }
   },


    /*
    * function for sign up details step 3
    * @req :  password
    */
    signUpDetailsStep3:async (req, res) => {
    try {
        const responseData = await onBoardingServices.signUpDetailsStep3(req.body, req.user);
        utilityFunction.successResponse(res, responseData, constants.MESSAGES.success);
    } catch (error) {
        utilityFunction.errorResponse(res, error, constants.code.error_code);
    }
    },

    changePassword:async (req, res) => {
        try {
            const responseFromService = await onBoardingServices.changePassword(req.body, req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.password_change_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    logout:async (req, res) => {
        try {
            const responseFromService = await onBoardingServices.logout(req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.logout_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    }


}














