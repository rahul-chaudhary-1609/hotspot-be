const utilityFunction = require('../../utils/utilityFunctions');
const restaurantService = require("../../services/admin/restaurant.service")
const constants = require("../../constants");

module.exports = {
    listRestaurant: async(req, res) => {
        try {
            const responseFromService = await restaurantService.listRestaurant(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    addRestaurant: async(req, res) => {
        try {
            const responseFromService = await restaurantService.addRestaurant(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    changeRestaurantStatus: async (req, res) => {
        try {
            const responseFromService = await restaurantService.changeRestaurantStatus({ ...req.params,...req.body });
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.action_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getRestaurant: async (req, res) => {
       try {
            const responseFromService = await restaurantService.getRestaurant(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }       

    },

    editRestaurant: async (req, res) => {
        try {
            const responseFromService = await restaurantService.editRestaurant({ ...req.params,...req.body });
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.update_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    deleteRestaurant: async (req, res) => { 
        try {
            const responseFromService = await restaurantService.deleteRestaurant(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.delete_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    // uploadRestaurantImage: async (req, res) => {
    //     try {
    //         const responseFromService = await restaurantService.uploadRestaurantImage(req.file);
    //         utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.picture_upload_success);
    //     } catch (error) {
    //         utilityFunction.errorResponse(res, error, constants.code.error_code);
    //     }
    // },

    restaurantCategoryList: async (req, res) => {
        try {
            const responseFromService = await restaurantService.restaurantCategoryLis();
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    dishCategoryList: async (req, res) => {
        try {
            const responseFromService = await restaurantService.dishCategoryList();
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    addDish: async (req, res) => {
        try {
            const responseFromService = await restaurantService.addDish(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },
    
    listDishes: async (req, res) => {
        try {
            const responseFromService = await restaurantService.listDishes(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },
    getDish: async (req, res) => {
        try {
            const responseFromService = await restaurantService.getDish(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }

    },

    editDish: async (req, res) => {
        try {
            const responseFromService = await restaurantService.editDish({ ...req.params,...req.body });
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.update_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }

    },

    deleteDish: async (req, res) => {
       try {
            const responseFromService = await restaurantService.deleteDish(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.delete_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    // uploadDishImage: async (req, res) => {
    //     try {
    //         const responseFromService = await restaurantService.uploadDishImage(req.file);
    //         utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.picture_upload_success);
    //     } catch (error) {
    //         utilityFunction.errorResponse(res, error, constants.code.error_code);
    //     }
    // },

}