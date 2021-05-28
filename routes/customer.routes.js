require('dotenv/config');
const express = require('express');

const joiValidation = require("../middlewares/joi");
const apiSchema = require("../apiSchema/customerSchema");

const {parseStringToArray}=require('../middlewares/validators')

const customerAuthentication = require('../middlewares/jwt');
const customerLoginController = require('../controllers/customer/login');
const HotspotLocationController = require('../controllers/customer/hotspot');
const RestaurantController = require('../controllers/customer/restaurant');
const OrderController = require('../controllers/customer/order');
const PaymentController = require('../controllers/customer/payment');
const customerMulter = require('../middlewares/multer');

const router=express.Router();

// Route for customer login with email
router.post('/customer-email-login', joiValidation.validateBody(apiSchema.emailLogin), customerLoginController.loginWithEmail);

// Route for customer login with phone
router.post('/customer-phone-login',joiValidation.validateBody(apiSchema.phoneLogin), customerLoginController.loginWithPhone);

// Route for customer login with google
router.post('/customer-google-login',joiValidation.validateBody(apiSchema.googleLogin), customerLoginController.loginWithGoogle);


// Route for customer login with facebook
router.post('/customer-facebook-login',joiValidation.validateBody(apiSchema.facebookLogin), customerLoginController.loginWithFacebook);


router.post('/customer-apple-login',joiValidation.validateBody(apiSchema.appleLogin), customerLoginController.loginWithApple);


// Route for customer signup with email and phone
router.post('/customer-email-signup',joiValidation.validateBody(apiSchema.customerSchema), customerLoginController.signupCustomer);



// Route for customer signup with google
router.post('/customer-google-signup',joiValidation.validateBody(apiSchema.googleLogin), customerLoginController.loginWithGoogle);



// Route for customer signup with facebook
router.post('/customer-facebook-signup',joiValidation.validateBody(apiSchema.facebookLogin), customerLoginController.loginWithFacebook);


router.post('/customer-apple-signup',joiValidation.validateBody(apiSchema.appleLogin), customerLoginController.loginWithApple);



router.post('/verify-phone',joiValidation.validateBody(apiSchema.phoneSchema),customerLoginController.generatePhoneOTP);

router.post('/validate-phone', joiValidation.validateBody(apiSchema.phoneSchema),customerLoginController.validatePhoneOTP);


router.get('/verify-email', joiValidation.validateQueryParams(apiSchema.emailSchema), customerLoginController.generateEmailOTP);

router.get('/validate-email',  joiValidation.validateQueryParams(apiSchema.emailSchema), customerLoginController.validateEmailOTP);

router.post('/send-password-reset-code', customerLoginController.generatePassResetCode);

router.post('/validate-password-reset-code',customerLoginController.validatePassResetCode);

router.put('/reset-password',customerLoginController.resetPassword);

router.get('/customer-profile', customerAuthentication.validateCustomerToken,  customerLoginController.getCustomerProfile);

router.post('/update-device-token', customerAuthentication.validateCustomerToken, joiValidation.validateBody(apiSchema.update_device_token), customerLoginController.update_device_token);

router.put('/customer-update-name', customerAuthentication.validateCustomerToken,joiValidation.validateBody(apiSchema.nameSchema),customerLoginController.updateCustomerName);

router.put('/customer-update-email', customerAuthentication.validateCustomerToken, joiValidation.validateBody(apiSchema.emailSchema), customerLoginController.updateCustomerEmail);

router.put('/customer-update-phone', customerAuthentication.validateCustomerToken,joiValidation.validateBody(apiSchema.phoneSchema),customerLoginController.updateCustomerphone);

router.post('/customer-add-address', customerAuthentication.validateCustomerToken, customerLoginController.addCustomerAddress);

router.get('/customer-get-address', customerAuthentication.validateCustomerToken,customerLoginController.getCustomerAddress);

router.put('/customer-set-default-address', customerAuthentication.validateCustomerToken, customerLoginController.setCustomerDefaultAddress);
 
router.put('/customer-change-password', customerAuthentication.validateCustomerToken,joiValidation.validateBody(apiSchema.passwordSchema), customerLoginController.changeCustomerPassword);

router.get('/check-default-address', customerAuthentication.validateCustomerToken,customerLoginController.checkDefaultAddress);

router.put('/customer-change-profile-picture', customerAuthentication.validateCustomerToken, customerMulter.upload, customerLoginController.changeCustomerPicture);

router.post('/customer-feedback', customerAuthentication.validateCustomerToken, joiValidation.validateBody(apiSchema.feedbackSchema),customerLoginController.feedbackCustomer);

router.put('/customer-toggle-notification', customerAuthentication.validateCustomerToken, customerLoginController.toggleNotification);

router.get('/get-notification-status', customerAuthentication.validateCustomerToken,customerLoginController.getNotificationStatus);

router.delete('/customer-logout', customerLoginController.logoutCustomer);



//Hotspot Locations Routes


router.get('/get-hotspot-location', customerAuthentication.validateCustomerToken, joiValidation.validateQueryParams(apiSchema.getHotspotSchema), HotspotLocationController.getHotspotLocation);

router.get('/check-hotspot-location', customerAuthentication.validateCustomerToken,HotspotLocationController.checkHotspotLocation);

router.get('/get-hotspot-dropoff', customerAuthentication.validateCustomerToken,HotspotLocationController.getHotspotDropoff);

router.get('/get-address-dropoff', customerAuthentication.validateCustomerToken, HotspotLocationController.getAddressDropoff);

router.get('/set-default-dropoff', customerAuthentication.validateCustomerToken,HotspotLocationController.setDefaultDropoff);

router.get('/get-default-hotspot', customerAuthentication.validateCustomerToken, HotspotLocationController.getDefaultHotspot);




//Restaurants Routes

// router.get('/get-restaurant', customerAuthentication.validateCustomerToken, joiValidation.validateQueryParams(apiSchema.getRestaurantSchema), RestaurantController.getRestaurant);

// router.get('/get-hotspot-restaurant', customerAuthentication.validateCustomerToken, joiValidation.validateQueryParams(apiSchema.getHotspotRestaurantSchema),RestaurantController.getHotspotRestaurant);

router.post('/set-favorite-restaurant', customerAuthentication.validateCustomerToken,  RestaurantController.setFavoriteRestaurant);

router.get('/get-favorite-restaurant', customerAuthentication.validateCustomerToken, joiValidation.validateQueryParams(apiSchema.getFavoriteRestaurantSchema), RestaurantController.getFavoriteRestaurant);

router.get('/get-food-category', customerAuthentication.validateCustomerToken, RestaurantController.getFoodCategory);

router.get('/get-restaurant-category', customerAuthentication.validateCustomerToken, RestaurantController.getRestaurantCategory);

router.get('/get-search-suggestion', customerAuthentication.validateCustomerToken,joiValidation.validateQueryParams(apiSchema.getSearchSuggestionSchema), RestaurantController.getSearchSuggestion);

// router.get('/get-search-result', customerAuthentication.validateCustomerToken,joiValidation.validateQueryParams(apiSchema.getSearchResultSchema), RestaurantController.getSearchResult);

// router.post('/get-hotspot-restaurant-with-filter', customerAuthentication.validateCustomerToken, RestaurantController.getHotspotRestaurantWithFilter);

router.post('/get-hotspot-restaurant-pickup', customerAuthentication.validateCustomerToken,parseStringToArray,joiValidation.validateBody(apiSchema.getHotspotRestaurantPickup), RestaurantController.getHotspotRestaurantPickup);

router.post('/get-hotspot-restaurant-delivery', customerAuthentication.validateCustomerToken,parseStringToArray,joiValidation.validateBody(apiSchema.getHotspotRestaurantDelivery), RestaurantController.getHotspotRestaurantDelivery);

// router.get('/get-hotspot-restaurant-with-quick-filter', customerAuthentication.validateCustomerToken,joiValidation.validateQueryParams(apiSchema.getQuickFilterSchema), RestaurantController.getHotspotRestaurantWithQuickFilter);

router.get('/get-offer-banner', customerAuthentication.validateCustomerToken, RestaurantController.getOfferBanner);

router.get('/get-restaurant-details', customerAuthentication.validateCustomerToken, RestaurantController.getRestaurantDetails);

router.get('/get-restaurant-schedule', customerAuthentication.validateCustomerToken, RestaurantController.getRestaurantSchedule);


//Foods Routes

router.get('/get-food-card-details', customerAuthentication.validateCustomerToken, RestaurantController.getFoodCardDetails);

router.put('/set-favorite-food', customerAuthentication.validateCustomerToken, RestaurantController.setFavoriteFood);

router.get('/get-favorite-food', customerAuthentication.validateCustomerToken, RestaurantController.getFavoriteFood);

router.get('/get-food-details/:restaurant_dish_id', customerAuthentication.validateCustomerToken, RestaurantController.getFoodDetails);

router.get('/get-recomended-slides', customerAuthentication.validateCustomerToken, RestaurantController.getRecomendedSlide);


//Orders routes
router.post('/add-to-cart', customerAuthentication.validateCustomerToken,parseStringToArray, OrderController.addToCart);

router.get('/get-cart/:restaurant_id/:order_type', customerAuthentication.validateCustomerToken,  OrderController.getCart)

router.delete('/delete-from-cart/:restaurantDishId', customerAuthentication.validateCustomerToken,OrderController.deleteFromCart)

router.post('/create-order', customerAuthentication.validateCustomerToken,parseStringToArray, OrderController.createOrder)

router.get('/get-pre-order-info/:orderId', customerAuthentication.validateCustomerToken, OrderController.getPreOrderInfo)

router.put('/set-pickup-time/:orderId', customerAuthentication.validateCustomerToken, OrderController.setPickupTime)

router.put('/confirm-order-payment/:orderId', customerAuthentication.validateCustomerToken, OrderController.confirmOrderPayment)

router.get('/get-orders', customerAuthentication.validateCustomerToken,  OrderController.getOrders)

router.get('/get-order-details/:orderId', customerAuthentication.validateCustomerToken, OrderController.getOrderDetails)

router.get('/get-track-status/:orderId', customerAuthentication.validateCustomerToken, OrderController.getTrackStatusOfOrder)




//payment routes
router.post('/add-payment-card', customerAuthentication.validateCustomerToken,joiValidation.validateBody(apiSchema.paymentCardSchema), PaymentController.addPaymentCard); 

router.put('/update-payment-card/:payment_card_id', customerAuthentication.validateCustomerToken,joiValidation.validateBody(apiSchema.paymentCardSchema),PaymentController.updatePaymentCard)

router.get('/get-payment-card/:payment_card_id', customerAuthentication.validateCustomerToken, PaymentController.getPaymentCard)

router.get('/get-payment-cards', customerAuthentication.validateCustomerToken, PaymentController.getPaymentCards)

router.put('/set-default-payment-card/:payment_card_id', customerAuthentication.validateCustomerToken, PaymentController.setDefaultPaymentCard)

router.delete('/delete-payment-card/:payment_card_id', customerAuthentication.validateCustomerToken, PaymentController.deletePaymentCard)

router.post('/payment',customerAuthentication.validateCustomerToken,joiValidation.validateBody(apiSchema.paymentCardSchema), PaymentController.payment)

router.put('/save-payment-info',customerAuthentication.validateCustomerToken, PaymentController.savePaymentInfo)


module.exports=router;
