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
const staticContentController = require('../controllers/customer/static_content');

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
router.put('/reset-password',joiValidation.validateBody(apiSchema.resetPassword),customerLoginController.resetPassword);
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
router.get('/get-notification-status', customerAuthentication.validateCustomerToken, customerLoginController.getNotificationStatus);
router.get('/get-notifications', customerAuthentication.validateCustomerToken, customerLoginController.getNotifications);
router.get('/get-unread-notification-count', customerAuthentication.validateCustomerToken,customerLoginController.getUnreadNotificationCount);
router.delete('/customer-logout',customerAuthentication.validateCustomerToken, customerLoginController.logoutCustomer);



//Hotspot Locations Routes


router.get('/get-hotspot-location', customerAuthentication.validateCustomerToken, joiValidation.validateQueryParams(apiSchema.getHotspotLocation), HotspotLocationController.getHotspotLocation);

router.get('/get-hotspot-dropoff', customerAuthentication.validateCustomerToken,joiValidation.validateQueryParams(apiSchema.getHotspotDropoff),HotspotLocationController.getHotspotDropoff);

router.get('/get-address-dropoff', customerAuthentication.validateCustomerToken,joiValidation.validateQueryParams(apiSchema.getAddressDropoff), HotspotLocationController.getAddressDropoff);

router.get('/set-default-dropoff', customerAuthentication.validateCustomerToken,joiValidation.validateQueryParams(apiSchema.setDefaultDropoff),HotspotLocationController.setDefaultDropoff);

router.get('/get-default-hotspot', customerAuthentication.validateCustomerToken, HotspotLocationController.getDefaultHotspot);




//Restaurants Routes

router.post('/set-favorite-restaurant', customerAuthentication.validateCustomerToken,joiValidation.validateBody(apiSchema.setFavoriteRestaurant),  RestaurantController.setFavoriteRestaurant);
router.get('/get-favorite-restaurant', customerAuthentication.validateCustomerToken, joiValidation.validateQueryParams(apiSchema.getFavoriteRestaurant), RestaurantController.getFavoriteRestaurant);
router.get('/get_quick_filter_list', customerAuthentication.validateCustomerToken,joiValidation.validateQueryParams(apiSchema.getQuickFilterList),  RestaurantController.getQuickFilterList);
router.get('/get-search-suggestion', customerAuthentication.validateCustomerToken,joiValidation.validateQueryParams(apiSchema.getSearchSuggestion), RestaurantController.getSearchSuggestion);
router.post('/get-hotspot-restaurant-pickup', customerAuthentication.validateCustomerToken,parseStringToArray,joiValidation.validateBody(apiSchema.getHotspotRestaurantPickup), RestaurantController.getHotspotRestaurantPickup);
router.post('/get-available-restaurants', customerAuthentication.validateCustomerToken,joiValidation.validateBody(apiSchema.getAvailableRestaurants), RestaurantController.getAvailableRestaurants);
router.post('/get-hotspot-restaurant-delivery', customerAuthentication.validateCustomerToken,parseStringToArray,joiValidation.validateBody(apiSchema.getHotspotRestaurantDelivery), RestaurantController.getHotspotRestaurantDelivery);
router.get('/get-offer-banner', customerAuthentication.validateCustomerToken, RestaurantController.getOfferBanner);
router.get('/get-restaurant-details', customerAuthentication.validateCustomerToken,joiValidation.validateQueryParams(apiSchema.getRestaurantDetails), RestaurantController.getRestaurantDetails);
router.get('/get-restaurant-schedule', customerAuthentication.validateCustomerToken,joiValidation.validateQueryParams(apiSchema.getRestaurantSchedule), RestaurantController.getRestaurantSchedule);


//Foods Routes

router.get('/get-restaurant-dish-categories', customerAuthentication.validateCustomerToken,joiValidation.validateQueryParams(apiSchema.getRestaurantDishCategories), RestaurantController.getRestaurantDishCategories);
router.get('/get-dishes', customerAuthentication.validateCustomerToken,joiValidation.validateQueryParams(apiSchema.getDishes), RestaurantController.getDishes);
router.get('/get-dish-details', customerAuthentication.validateCustomerToken,joiValidation.validateQueryParams(apiSchema.getDishDetails), RestaurantController.getDishDetails);
router.put('/set-favorite-food', customerAuthentication.validateCustomerToken,joiValidation.validateBody(apiSchema.setFavoriteFood), RestaurantController.setFavoriteFood);
router.get('/get-favorite-food', customerAuthentication.validateCustomerToken,joiValidation.validateQueryParams(apiSchema.getFavoriteFood), RestaurantController.getFavoriteFood);
router.get('/get-recomended-slides', customerAuthentication.validateCustomerToken,joiValidation.validateQueryParams(apiSchema.getRecomendedSlide), RestaurantController.getRecomendedSlide);


//Orders routes
router.get('/check-cart-item', customerAuthentication.validateCustomerToken,joiValidation.validateQueryParams(apiSchema.checkCartItem), OrderController.checkCartItem);
router.post('/add-to-cart', customerAuthentication.validateCustomerToken,parseStringToArray,joiValidation.validateBody(apiSchema.addToCart), OrderController.addToCart);
router.get('/get-cart-item-by-id', customerAuthentication.validateCustomerToken,joiValidation.validateQueryParams(apiSchema.getCartItemById), OrderController.getCartItemById);
router.put('/edit-cart-item', customerAuthentication.validateCustomerToken,parseStringToArray,joiValidation.validateBody(apiSchema.editCartItem), OrderController.editCartItem);
router.get('/get-cart-item-count', customerAuthentication.validateCustomerToken, OrderController.getCartItemCount);
router.get('/get-cart', customerAuthentication.validateCustomerToken,  OrderController.getCart)
router.delete('/delete-from-cart/:cart_item_id', customerAuthentication.validateCustomerToken,OrderController.deleteFromCart)
router.post('/create-order', customerAuthentication.validateCustomerToken,parseStringToArray,joiValidation.validateBody(apiSchema.createOrder), OrderController.createOrder)
router.get('/get-pre-order-info/:orderId', customerAuthentication.validateCustomerToken, OrderController.getPreOrderInfo)
router.put('/set-pickup-time/:orderId', customerAuthentication.validateCustomerToken, OrderController.setPickupTime)
router.put('/update-tip-amount', customerAuthentication.validateCustomerToken,joiValidation.validateBody(apiSchema.updateTipAmount), OrderController.updateTipAmount)
router.put('/confirm-order-payment/:orderId', customerAuthentication.validateCustomerToken, OrderController.confirmOrderPayment)
router.get('/get-orders', customerAuthentication.validateCustomerToken, joiValidation.validateQueryParams(apiSchema.getOrders),  OrderController.getOrders)
router.get('/get-completed-orders', customerAuthentication.validateCustomerToken, joiValidation.validateQueryParams(apiSchema.getCompletedOrders),  OrderController.getCompletedOrders)
router.post('/raise-dispute', customerAuthentication.validateCustomerToken, joiValidation.validateBody(apiSchema.raiseDispute),  OrderController.raiseDispute)
router.get('/get-order-details/:orderId', customerAuthentication.validateCustomerToken, OrderController.getOrderDetails)
router.get('/get-track-status/:orderId', customerAuthentication.validateCustomerToken, OrderController.getTrackStatusOfOrder)
router.get('/get-order-delivery-image/:order_id', customerAuthentication.validateCustomerToken,joiValidation.validateParams(apiSchema.getOrderDeliveryImage), OrderController.getOrderDeliveryImage)




//payment routes
router.get('/get-credit', customerAuthentication.validateCustomerToken, PaymentController.getCredit); 
router.post('/add-payment-card', customerAuthentication.validateCustomerToken,joiValidation.validateBody(apiSchema.addPaymentCard), PaymentController.addPaymentCard); 
router.put('/update-payment-card', customerAuthentication.validateCustomerToken,joiValidation.validateBody(apiSchema.updatePaymentCard),PaymentController.updatePaymentCard)
router.get('/get-payment-card/:payment_card_id', customerAuthentication.validateCustomerToken,joiValidation.validateParams(apiSchema.getPaymentCard), PaymentController.getPaymentCard)
router.get('/get-payment-cards', customerAuthentication.validateCustomerToken, PaymentController.getPaymentCards)
router.put('/set-default-payment-card/:payment_card_id', customerAuthentication.validateCustomerToken,joiValidation.validateParams(apiSchema.setDeafultPaymentCard), PaymentController.setDefaultPaymentCard)
router.delete('/delete-payment-card/:payment_card_id', customerAuthentication.validateCustomerToken, joiValidation.validateParams(apiSchema.deletePaymentCard),PaymentController.deletePaymentCard)
router.post('/payment',customerAuthentication.validateCustomerToken,joiValidation.validateBody(apiSchema.payment), PaymentController.payment)
router.post('/payment-success',customerAuthentication.validateCustomerToken,joiValidation.validateBody(apiSchema.paymentSuccess), PaymentController.paymentSuccess)


// statticContent API's
router.get('/getStaticContent/:type',customerAuthentication.validateCustomerToken, joiValidation.validateParams(apiSchema.getStaticContent),staticContentController.getStaticContent);
router.get('/getFaqTopics',customerAuthentication.validateCustomerToken, staticContentController.getFaqTopics);
router.get('/getFaqs',customerAuthentication.validateCustomerToken, joiValidation.validateQueryParams(apiSchema.getFaqs), staticContentController.getFaqs);
router.get('/htmlFileUrlToTextConvert',customerAuthentication.validateCustomerToken, staticContentController.htmlFileUrlToTextConvert);



module.exports=router;
