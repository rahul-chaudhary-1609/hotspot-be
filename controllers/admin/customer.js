
const utilityFunction = require('../../utils/utilityFunctions');
const customerService = require("../../services/admin/customer.service")
const constants = require("../../constants");

module.exports = {
    listCustomers: async (req, res) => {
        try {
            const responseFromService = await customerService.listCustomers(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    viewCustomerProfile: async (req, res) => {
        try {
            const responseFromService = await customerService.viewCustomerProfile(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    changeCustomerStatus: async (req, res) => {
        try {
            const responseFromService = await customerService.changeCustomerStatus({ ...req.params,...req.body });
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.action_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    // uploadCustomerImage: async (req, res) => {
    //     try {
    //         const responseFromService = await customerService.uploadCustomerImage(req.file);
    //         utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.picture_upload_success);
    //     } catch (error) {
    //         utilityFunction.errorResponse(res, error, constants.code.error_code);
    //     }
    // },
        
        
    editCustomer: async (req, res) => {
        try {
            const responseFromService = await customerService.editCustomer({ ...req.params,...req.body });
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.update_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    deleteCustomer : async (req, res) => {
        try {
            const responseFromService = await customerService.deleteCustomer({ ...req.params,...req.body },req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.delete_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    listActiveCustomers: async (req, res) => {
        try {
            const responseFromService = await customerService.listActiveCustomers();
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    addPromotionalCredits : async (req, res) => {
        try {
            const responseFromService = await customerService.addPromotionalCredits(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    }
}