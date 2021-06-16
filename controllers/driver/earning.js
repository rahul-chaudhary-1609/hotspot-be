const utilityFunction = require('../../utils/utilityFunctions');
const constants = require("../../constants");
const { sendResponse } = require('../../utils/handler');
const earningServices  = require("../../services/driver/earinng.service");

module.exports = {
        /*
    * function for get earning list
    * @req :  type, start date, end date
    */
   getEarningList:async (req, res) => {
    try {
        const getEarningListData = await earningServices.getEarningList(req.user,req.query);
        utilityFunction.successResponse(res, getEarningListData, constants.MESSAGES.success);
    } catch (error) {
        utilityFunction.errorResponse(res, error, constants.code.error_code);
    }
  },

      /*
    * function for get earning details
    * @req :  type, id
    */
/*   getEarningDetails:async (req, res) => {
    try {
        const getEarningListData = await earningServices.getEarningDetails(req.query);
        utilityFunction.successResponse(res, getEarningListData, constants.MESSAGES.success);
    } catch (error) {
        utilityFunction.errorResponse(res, error, constants.code.error_code);
    }
  }*/

     getTotalEarnings:async (req, res) => {
    try {
        const getTotalEarnings = await earningServices.getTotalEarnings(req.user,req.query);
        utilityFunction.successResponse(res, getTotalEarnings, constants.MESSAGES.success);
    } catch (error) {
        utilityFunction.errorResponse(res, error, constants.code.error_code);
    }
  },

  getDeliveryHistory : async (req, res) => {
    try {
        const responseFromService = await earningServices.getDeliveryHistory(req.user,req.query);
        utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
    } catch (error) {
        utilityFunction.errorResponse(res, error, constants.code.error_code);
    }
},
}





