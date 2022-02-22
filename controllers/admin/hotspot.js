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

    listAllRestaurant: async (req, res) => {
        try {
            const responseFromService = await hotspotService.listAllRestaurant();
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    listAllDriver: async (req, res) => {
        try {
            const responseFromService = await hotspotService.listAllDriver();
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    editHotspot: async (req, res) => {
        try {
            const responseFromService = await hotspotService.editHotspot(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.update_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    listHotspot: async (req, res) => {
       try {
            const responseFromService = await hotspotService.listHotspot(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getHotspot: async (req, res) => {
        try {
            const responseFromService = await hotspotService.getHotspot(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    deleteHotspot: async (req, res) => {
       try {
            const responseFromService = await hotspotService.deleteHotspot(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.delete_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    toggleHotspotAvailibility: async (req, res) => {
        try {
             const responseFromService = await hotspotService.toggleHotspotAvailibility(req.body);
             utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
         } catch (error) {
             utilityFunction.errorResponse(res, error, constants.code.error_code);
         }
     },
}