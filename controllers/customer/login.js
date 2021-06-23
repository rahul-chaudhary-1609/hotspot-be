require('dotenv/config');
const utilityFunction = require('../../utils/utilityFunctions');
const loginService = require("../../services/customer/login.service")
const constants = require("../../constants");


module.exports = {
    
    loginWithEmail: async (req, res) => {
    
        try {
            const responseFromService = await loginService.loginWithEmail(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.log_in);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    loginWithPhone: async (req, res) => {

        try {
            const responseFromService = await loginService.loginWithPhone(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.log_in);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }

    },


    signupCustomer: async (req, res) => {

        try {
            const responseFromService = await loginService.signupCustomer(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    
    },


    loginWithGoogle: async (req, res) => {
    
        try {
            const responseFromService = await loginService.loginWithGoogle(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.login_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }

    },

    loginWithFacebook: async (req, res) => {

        try {
            const responseFromService = await loginService.loginWithFacebook(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.login_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    
    },

    loginWithApple: async (req, res) => {

        try {
            const responseFromService = await loginService.loginWithApple(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.login_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },    

    generatePhoneOTP: async (req, res) => {
    try {
            const responseFromService = await loginService.generatePhoneOTP(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.verification_code_sent);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    validatePhoneOTP: async (req, res) => {
    
        try {
            const responseFromService = await loginService.validatePhoneOTP(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.otp_verified_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },
 

    generateEmailOTP: async (req, res) => {
        try {
            const responseFromService = await loginService.generateEmailOTP(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.verification_code_sent);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    
    },


    validateEmailOTP: async (req, res) => {
        try {
            const responseFromService = await loginService.validateEmailOTP(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.otp_verified_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    generatePassResetCode: async (req, res) => {
        try {
            const responseFromService = await loginService.generatePassResetCode(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.verification_code_sent);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    
    },


    validatePassResetCode: async (req, res) => {
    
        try {
            const responseFromService = await loginService.validatePassResetCode(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.otp_verified_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    
    },

    resetPassword: async (req, res) => {
        try {
            const responseFromService = await loginService.resetPassword(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.password_change_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    changeCustomerPicture: async (req, res) => {
        
        try {
            const responseFromService = await loginService.changeCustomerPicture(req.file,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.file_upload_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getCustomerProfile: async (req, res) => {
        try {
            const responseFromService = await loginService.getCustomerProfile(req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    
    },

    changeCustomerPassword: async (req, res) => {
        try {
            const responseFromService = await loginService.changeCustomerPassword(req.body,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.password_change_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    updateCustomerName: async (req, res) => {
    
        try {
            const responseFromService = await loginService.updateCustomerName(req.body,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.update_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    updateCustomerEmail: async (req, res) => {
        try {
            const responseFromService = await loginService.updateCustomerEmail(req.body,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.update_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    updateCustomerphone: async (req, res) => {
        try {
            const responseFromService = await loginService.updateCustomerphone(req.body,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.update_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    addCustomerAddress: async (req, res) => {
    
        try {
            const responseFromService = await loginService.addCustomerAddress(req.body,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getCustomerAddress: async (req, res) => {
        try {
            const responseFromService = await loginService.getCustomerAddress(req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    setCustomerDefaultAddress: async (req, res) => {
        try {
            const responseFromService = await loginService.setCustomerDefaultAddress(req.body,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    checkDefaultAddress: async (req, res) => {
      try {
            const responseFromService = await loginService.checkDefaultAddress(req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    feedbackCustomer: async(req, res) => {
        try {
            const responseFromService = await loginService.feedbackCustomer(req.body,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
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
    getNotificationStatus: async (req, res) => {
        try {
            const responseFromService = await loginService.getNotificationStatus(req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },



    logoutCustomer: async (req, res) => {
    
        try {
            const responseFromService = await loginService.logoutCustomer(req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    
    
    },

    update_device_token: async (req, res) => {
    
        try {
            const responseFromService = await loginService.update_device_token(req.body,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.update_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getNotifications: async (req, res) => {
    
        try {
            const responseFromService = await loginService.getNotifications(req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    
    
    },

    getUnreadNotificationCount: async (req, res) => {
    
        try {
            const responseFromService = await loginService.getUnreadNotificationCount(req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    
    
    },

}

