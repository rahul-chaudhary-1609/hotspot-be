require('dotenv/config');
const utilityFunction = require('../../utils/utilityFunctions');
const hotspotService = require("../../services/customer/hotspot.service")
const constants = require("../../constants");


module.exports = {
    getHotspotLocation: async (req, res) => {

       try {
            const responseFromService = await hotspotService.getHotspotLocation(req.query,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }

    },

    getHotspotDropoff: async (req, res) => {
      try {
            const responseFromService = await hotspotService.getHotspotDropoff(req.query,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getAddressDropoff: async (req, res) => {
      try {
            const responseFromService = await hotspotService.getAddressDropoff(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    setDefaultDropoff: async (req, res) => {
      try {
            const responseFromService = await hotspotService.setDefaultDropoff(req.query,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        } 
    },

    getDefaultHotspot: async (req, res) => {
        try {
            const responseFromService = await hotspotService.getDefaultHotspot(req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    }
}
