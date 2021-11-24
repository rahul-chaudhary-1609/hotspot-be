require('dotenv/config');
const utilityFunction = require('../../utils/utilityFunctions');
const orderService = require("../../services/customer/order.service")
const constants = require("../../constants");

const logger = require('../../services/loggerService')


module.exports = {
    
    checkCartItem: async (req, res) => {
        try {
            const responseFromService = await orderService.checkCartItem(req.query,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    addToCart: async (req, res) => {
        try {
            const responseFromService = await orderService.addToCart(req.body,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getCartItemById: async (req, res) => {
        try {
            const responseFromService = await orderService.getCartItemById(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    editCartItem: async (req, res) => {
        try {
            const responseFromService = await orderService.editCartItem(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getCartItemCount: async (req, res) => {
        try {
            const responseFromService = await orderService.getCartItemCount(req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    deleteFromCart: async (req, res) => {
        try {
            const responseFromService = await orderService.deleteFromCart(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },
    
    getCart: async (req, res) => {
        try {
            const responseFromService = await orderService.getCart(req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    createOrder:async (req, res) => {
       try {
            logger.info('createOrder route is accessed')
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

    updateTipAmount: async (req, res) => {
        try {
            const responseFromService = await orderService.updateTipAmount(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    confirmOrderPayment:async (req, res) => {
        try {
            const responseFromService = await orderService.confirmOrderPaymentTest(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.confirm_payment);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getOrders: async (req, res) => {
        try {
            const responseFromService = await orderService.getOrders(req.user,req.query);
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
    },

    getOrderDeliveryImage: async (req, res) => {
        try {
            const responseFromService = await orderService.getOrderDeliveryImage(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getOrdersHelp: async (req, res) => {
        try {
            const responseFromService = await orderService.getOrdersHelp(req.user,req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },
}