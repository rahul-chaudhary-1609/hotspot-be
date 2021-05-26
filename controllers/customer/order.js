require('dotenv/config');
const utilityFunction = require('../../utils/utilityFunctions');
const orderService = require("../../services/customer/order.service")
const constants = require("../../constants");


module.exports = {
    addToCart: async (req, res) => {
        try {
            const responseFromService = await orderService.addToCart(req.body,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    deleteFromCart: async (req, res) => {
        try {
            const responseFromService = await orderService.deleteFromCart(req.params,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },
    
    getCart: async (req, res) => {
        try {
            const responseFromService = await orderService.getCart(req.params,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    createOrder:async (req, res) => {
       try {
            const responseFromService = await orderService.createOrder(req.body,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    

    getPreOrderInfo: async (req, res) => {
        try {
            const responseFromService = await orderService.getPreOrderInfo(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    setPickupTime: async (req, res) => {
        try {
            const responseFromService = await orderService.setPickupTime({ ...req.body,...req.params });
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    confirmOrderPayment:async (req, res) => {
        try {
            const responseFromService = await orderService.confirmOrderPayment(req.params,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.confirm_payment);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getOrders: async (req, res) => {
        try {
            const responseFromService = await orderService.getOrders(req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getOrderDetails: async (req, res) => {
        try {
            const responseFromService = await orderService.getOrderDetails(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getTrackStatusOfOrder: async (req, res) => {
        try {
            const responseFromService = await orderService.getTrackStatusOfOrder(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    }
}