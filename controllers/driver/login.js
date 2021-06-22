const utilityFunction = require('../../utils/utilityFunctions');
const constants = require("../../constants");
const { ErrorHandler, handleError, sendResponse } = require('../../utils/handler');
const loginService  = require("../../services/driver/login.service");

module.exports = {
        /*
    * function for login
    * @req :  phone, password
    */
   login:async (req, res) => {
    try {
        const loginData = await loginService.login(req.body);
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
        const forgotPasswordRes = await loginService.forgotPassword(req.body);
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
        const forgotPasswordRes = await loginService.verifyOTP(req.body);
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
            const responseFromService = await loginService.resetPassword(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.password_change_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

       /*
    * function for sign up step 1
    * @req :  password
    */
   signUp:async (req, res) => {
    try {
        const forgotPasswordRes = await loginService.signUp(req.body);
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
        const responseData = await loginService.signUpDetailsStep1(req.body);
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
        const responseData = await loginService.signUpDetailsStep2(req.body);
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
            const responseData = await loginService.signUpDetailsStep3(req.body);
            utilityFunction.successResponse(res, responseData, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getDriverAccount:async (req, res) => {
        try {
            const responseData = await loginService.getDriverAccount(req.user);
            utilityFunction.successResponse(res, responseData, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    checkPhoneUpdate:async (req, res) => {
        try {
            const responseData = await loginService.checkPhoneUpdate(req.query,req.user);
            utilityFunction.successResponse(res, responseData, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    editDriverAccount:async (req, res) => {
        try {
            const responseData = await loginService.editDriverAccount(req.body,req.user);
            utilityFunction.successResponse(res, responseData, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    changePassword:async (req, res) => {
        try {
            const responseFromService = await loginService.changePassword(req.body, req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.password_change_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    toggleNotification: async (req, res) => {
        try {
            const responseFromService = await loginService.toggleNotification(req.body,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    updateDeviceToken:async (req, res) => {
        try {
            const responseFromService = await loginService.updateDeviceToken(req.body,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.logout_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    logout:async (req, res) => {
        try {
            const responseFromService = await loginService.logout(req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.logout_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    uploadFile: async (req, res) => {
        try {
            const responseFromService = await loginService.uploadFile({...req.file,...req.body});
            console.log("responseFromService", responseFromService)
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.picture_upload_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

}














