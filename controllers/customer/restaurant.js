require('dotenv/config');
const utilityFunction = require('../../utils/utilityFunctions');
const restaurantService = require("../../services/customer/restaurant.service")
const constants = require("../../constants");


module.exports = {
    setFavoriteRestaurant: async(req, res) => {
         try {
            const responseFromService = await restaurantService.setFavoriteRestaurant(req.body,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }

    },

    getFavoriteRestaurant: async (req, res) => {
      try {
            const responseFromService = await restaurantService.getFavoriteRestaurant(req.query,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }

    },

    getRestaurantCategory: async (req, res) => {
         try {
            const responseFromService = await restaurantService.getRestaurantCategory();
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }

    },

    getQuickFilterList: async (req, res) => {
         try {
            const responseFromService = await restaurantService.getQuickFilterList(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }

    },

    getSearchSuggestion: async (req, res) => {
         try {
            const responseFromService = await restaurantService.getSearchSuggestion(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }

    },
    getOfferBanner: async (req, res) => {
         try {
            const responseFromService = await restaurantService.getOfferBanner();
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }

    },

    getHotspotRestaurantPickup: async (req, res) => {
         try {
            const responseFromService = await restaurantService.getHotspotRestaurantPickup(req.body,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
 
    },
    getHotspotRestaurantDelivery: async (req, res) => {
    try {
                const responseFromService = await restaurantService.getHotspotRestaurantDelivery(req.body,req.user);
                utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
            } catch (error) {
                utilityFunction.errorResponse(res, error, constants.code.error_code);
            }
    },

    getRestaurantDetails: async (req, res) => {
         try {
            const responseFromService = await restaurantService.getRestaurantDetails(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }


    },

    getRestaurantSchedule: async (req, res) => {
         try {
            const responseFromService = await restaurantService.getRestaurantSchedule(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }

    },

    getFoodCardDetails: async (req, res) => {
      try {
            const responseFromService = await restaurantService.getFoodCardDetails(req.query,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }

    },

    setFavoriteFood: async (req, res) => {
         try {
            const responseFromService = await restaurantService.setFavoriteFood(req.body,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }

    },

    getFavoriteFood: async (req, res) => {
       try {
            const responseFromService = await restaurantService.getFavoriteFood(req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }

    },

    getFoodDetails: async (req, res) => {
         try {
            const responseFromService = await restaurantService.getFoodDetails(req.params,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }

    },

    getRecomendedSlide: async (req, res) => {
         try {
            const responseFromService = await restaurantService.getRecomendedSlide(req.query,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }

    }

}