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

}

module.exports = { OnBoardingController }