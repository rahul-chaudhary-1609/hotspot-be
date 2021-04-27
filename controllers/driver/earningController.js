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
          console.log(req.query);
            const getEarningListData = await earningServices.getEarningList(req.query);
            return sendResponse(res, constants.MESSAGES.success, getEarningListData);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = { EarningController }