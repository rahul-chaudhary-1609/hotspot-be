const utilityFunction = require('../../utils/utilityFunctions');
const accountServices = require("../../services/driver/accountServices")

const constants = require("../../constants");

module.exports = {

    editDriverPersonalDetails: async (req, res) => {
        try {
            const driverDetails = await accountServices.editPersonalDetails(req.body,req.user);
            utilityFunction.successResponse(res, driverDetails, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getDriverPersonalDetails: async (req, res) => {
        try {
            const driverDetails = await accountServices.getPersonalDetails(req.user);
            utilityFunction.successResponse(res, driverDetails.dataValues, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    editDriverAddressDetails: async (req, res) => {
        try {
            const addressDetails = await accountServices.editAddressDetails(req.body,req.user);
            utilityFunction.successResponse(res, addressDetails, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getDriverAddressDetails: async (req, res) => {
        try {
            const addressDetails = await accountServices.getAddressDetails(req.user);
            utilityFunction.successResponse(res, addressDetails.dataValues, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },
    editDriverVehicleDetails: async (req, res) => {
        try {
            const vehicleDetails = await accountServices.editVehicleDetails(req.body,req.user);
            utilityFunction.successResponse(res, vehicleDetails, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getDriverVehicleDetails: async (req, res) => {
        try {
            const vehicleDetails = await accountServices.getVehicleDetails(req.user);
            utilityFunction.successResponse(res, vehicleDetails.dataValues, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    editDriverBankDetails: async (req, res) => {
        try {
            const bankDetails = await accountServices.editBankDetails(req.body,req.user);
            utilityFunction.successResponse(res, bankDetails, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getDriverBankDetails: async (req, res) => {
        try {
            const bankDetails = await accountServices.getBankDetails(req.user);
            utilityFunction.successResponse(res, bankDetails,dataValues, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },
    




   
}