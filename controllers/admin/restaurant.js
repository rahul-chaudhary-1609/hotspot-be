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

    toggleRestaurantStatus: async (req, res) => {
        try {
            const responseFromService = await restaurantService.toggleRestaurantStatus(req.body);
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
            const responseFromService = await restaurantService.editRestaurant(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.update_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    deleteRestaurant: async (req, res) => { 
        try {
            const responseFromService = await restaurantService.deleteRestaurant(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.delete_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    addRestaurantDishCategory: async (req, res) => { 
        try {
            const responseFromService = await restaurantService.addRestaurantDishCategory(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    editRestaurantDishCategory: async (req, res) => { 
        try {
            const responseFromService = await restaurantService.editRestaurantDishCategory(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    listRestaurantDishCategories: async (req, res) => { 
        try {
            const responseFromService = await restaurantService.listRestaurantDishCategories(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getRestaurantDishCategory: async (req, res) => { 
        try {
            const responseFromService = await restaurantService.getRestaurantDishCategory(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    deleteRestaurantDishCategory: async (req, res) => { 
        try {
            const responseFromService = await restaurantService.deleteRestaurantDishCategory(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.delete_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    toggleRestaurantDishCategoryStatus: async (req, res) => { 
        try {
            const responseFromService = await restaurantService.toggleRestaurantDishCategoryStatus(req.body);
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
            const responseFromService = await restaurantService.editDish(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.update_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }

    },

    deleteDish: async (req, res) => {
       try {
            const responseFromService = await restaurantService.deleteDish(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.delete_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    toggleDishStatus: async (req, res) => {
        try {
             const responseFromService = await restaurantService.toggleDishStatus(req.body);
             utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
         } catch (error) {
             utilityFunction.errorResponse(res, error, constants.code.error_code);
         }
     },

    toggleDishAsRecommended: async (req, res) => {
       try {
            const responseFromService = await restaurantService.toggleDishAsRecommended(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    toggleDishAsQuickFilter: async (req, res) => {
       try {
            const responseFromService = await restaurantService.toggleDishAsQuickFilter(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    addDishAddOnSection: async (req, res) => { 
        try {
            const responseFromService = await restaurantService.addDishAddOnSection(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    editDishAddOnSection: async (req, res) => { 
        try {
            const responseFromService = await restaurantService.editDishAddOnSection(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    listDishAddOnSections: async (req, res) => { 
        try {
            const responseFromService = await restaurantService.listDishAddOnSections(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getDishAddOnSection: async (req, res) => { 
        try {
            const responseFromService = await restaurantService.getDishAddOnSection(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    deleteDishAddOnSection: async (req, res) => { 
        try {
            const responseFromService = await restaurantService.deleteDishAddOnSection(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.delete_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    toggleDishAddOnSectionStatus: async (req, res) => { 
        try {
            const responseFromService = await restaurantService.toggleDishAddOnSectionStatus(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    
    addDishAddon: async (req, res) => {
        try {
            const responseFromService = await restaurantService.addDishAddon(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },
    
    listDishAddon: async (req, res) => {
        try {
            const responseFromService = await restaurantService.listDishAddon(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },
    getDishAddon: async (req, res) => {
        try {
            const responseFromService = await restaurantService.getDishAddon(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }

    },

    editDishAddon: async (req, res) => {
        try {
            const responseFromService = await restaurantService.editDishAddon(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.update_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }

    },

    deleteDishAddon: async (req, res) => {
       try {
            const responseFromService = await restaurantService.deleteDishAddon(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.delete_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    toggleDishAddonStatus: async (req, res) => {
        try {
             const responseFromService = await restaurantService.toggleDishAddonStatus(req.body);
             utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
         } catch (error) {
             utilityFunction.errorResponse(res, error, constants.code.error_code);
         }
     },

}