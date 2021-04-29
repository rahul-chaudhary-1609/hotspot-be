const utilityFunction = require('../../utils/utilityFunctions');
const constants = require("../../constants");
const { sendResponse } = require('../../utils/handler');
const { EarningServices } = require("../../services/driver/earinngServices");

const earningServices = new EarningServices(); 

class EarningController {
    constructor() { }

    /*
    * function for get earning list
    * @req :  type, start date, end date
    */
    getEarningList = async (req, res, next) => {
        try {
            const getEarningListData = await earningServices.getEarningList(req.query);
            return sendResponse(res, constants.MESSAGES.success, getEarningListData);
        } catch (e) {
            next(e);
        }
    }

    /*
    * function for get earning details
    * @req :  type, id
    */
    getEarningDetails = async (req, res, next) => {
        try {
            const getEarningListData = await earningServices.getEarningDetails(req.query);
            return sendResponse(res, constants.MESSAGES.success, getEarningListData);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = { EarningController }