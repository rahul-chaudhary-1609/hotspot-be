require('dotenv/config');
const utilityFunction = require('../../utils/utilityFunctions');
const restaurantService = require("../../services/customer/restaurant.service")
const constants = require("../../constants");


module.exports = {
    getRestaurant: async (req, res) => {
       try {
            const responseFromService = await restaurantService.getRestaurant(req.query,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }

    },

    getHotspotRestaurant: async (req, res) => {
         try {
            const responseFromService = await restaurantService.getHotspotRestaurant(req.query,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }

    },
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

    getFoodCategory: async (req, res) => {
         try {
            const responseFromService = await restaurantService.getFoodCategory();
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }

    },

    getHotspotRestaurantWithFilter: async (req, res) => {
         try {
            const responseFromService = await restaurantService.getHotspotRestaurantWithFilter(req.body,req.user);
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
    getSearchResult: async (req, res) => {
         try {
            const responseFromService = await restaurantService.getSearchResult(req.query,req.user);
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
    getHotspotRestaurantWithQuickFilter: async (req, res) => {
    try {
                const responseFromService = await restaurantService.getHotspotRestaurantWithQuickFilter(req.query,req.user);
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
            const responseFromService = await restaurantService.setFavoriteFood(req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }

    },

    getFavoriteFood: async (req, res) => {
       try {
            const responseFromService = await restaurantService.getFavoriteFood(req.query,req.user);
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