const utilityFunction = require('../../utils/utilityFunctions');
const hotspotService = require("../../services/admin/hotspot.service")
const constants = require("../../constants");

module.exports = {
    addHotspot: async (req, res) => {
        try {
            const responseFromService = await hotspotService.addHotspot(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    editHotspot: async (req, res) => {
        try {
            const responseFromService = await hotspotService.editHotspot({...req.params,...req.body});
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.update_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    listHotspots: async (req, res) => {
       try {
            const responseFromService = await hotspotService.listHotspots(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getHotspotDetails: async (req, res) => {
        try {
            const responseFromService = await hotspotService.getHotspotDetails(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    deleteHotspot: async (req, res) => {
       try {
            const responseFromService = await hotspotService.deleteHotspot(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.delete_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },
}