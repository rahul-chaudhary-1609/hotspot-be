require('dotenv/config');
const express = require('express');
const customerAuthentication = require('../middlewares/jwt');
const customerLoginController = require('../controllers/customer/login');
const HotspotLocationController = require('../controllers/customer/hotspot_location');
const RestaurantController = require('../controllers/customer/restaurant');
const OrderController = require('../controllers/customer/order');
const PaymentController = require('../controllers/customer/payment');
const customerMulter = require('../middlewares/multer');

const router=express.Router();

// Route for customer login with email
router.post('/customer-email-login', (req, res) => {
    return customerLoginController.loginWithEmail(req, res);
});

// Route for customer login with phone
router.post('/customer-phone-login', (req, res) => {
    return customerLoginController.loginWithPhone(req, res);
});

// Route for customer login with google
router.post('/customer-google-login', (req, res) => {
    return customerLoginController.loginWithGoogle(req,res);
});

// Route for customer login with facebook
router.post('/customer-facebook-login', (req, res) => {
    return customerLoginController.loginWithFacebook(req, res);
});

router.post('/customer-apple-login', (req, res) => {
    return customerLoginController.loginWithApple(req, res);
});

// Route for customer signup with email and phone
router.post('/customer-email-signup', (req, res) => {
    return customerLoginController.signupCustomer(req, res);      
});


// Route for customer signup with google
router.post('/customer-google-signup', async (req, res) => {
    return customerLoginController.loginWithGoogle(req, res);
});

// Route for customer signup with facebook
router.post('/customer-facebook-signup', async (req, res) => {
    return customerLoginController.loginWithFacebook(req, res);
});

router.post('/customer-apple-signup', async (req, res) => {
    return customerLoginController.loginWithApple(req, res);
});


router.post('/verify-phone', (req, res) => {
    return customerLoginController.generatePhoneOTP(req,res)            
});

router.post('/validate-phone', async (req, res) => {
    return customerLoginController.validatePhoneOTP(req, res);
});


router.get('/verify-email', (req, res) => {     
    return customerLoginController.generateEmailOTP(req, res);    
});

router.get('/validate-email', async (req, res) => {
    return customerLoginController.validateEmailOTP(req, res);  
});

router.post('/send-password-reset-code', async(req, res) => {
    return customerLoginController.generatePassResetCode(req, res)   
})

router.post('/validate-password-reset-code', async (req, res) => {
    return customerLoginController.validatePassResetCode(req, res);        
});

router.put('/reset-password', (req, res) => {
    return customerLoginController.resetPassword(req,res);
});

router.get('/customer-profile', customerAuthentication.validateCustomerToken, (req, res) => {
    return customerLoginController.getCustomerProfile(req, res);
});

router.put('/customer-update-name', customerAuthentication.validateCustomerToken, (req, res) => {
    return customerLoginController.updateCustomerName(req, res);
});

router.put('/customer-update-email', customerAuthentication.validateCustomerToken, (req, res) => {
    return customerLoginController.updateCustomerEmail(req, res);
});

router.put('/customer-update-phone', customerAuthentication.validateCustomerToken, (req, res) => {
    return customerLoginController.updateCustomerphone(req, res);
});

router.post('/customer-add-address', customerAuthentication.validateCustomerToken, (req, res) => {
    return customerLoginController.addCustomerAddress(req, res);
});

router.get('/customer-get-address', customerAuthentication.validateCustomerToken, (req, res) => {
    return customerLoginController.getCustomerAddress(req, res);
});

router.put('/customer-set-default-address', customerAuthentication.validateCustomerToken, (req, res) => {
    return customerLoginController.setCustomerDefaultAddress(req, res);
});
 
router.put('/customer-change-password', customerAuthentication.validateCustomerToken, (req, res) => {
    return customerLoginController.changeCustomerPassword(req, res);
});

router.get('/check-default-address', customerAuthentication.validateCustomerToken, (req, res) => {
    return customerLoginController.checkDefaultAddress(req, res);
});

router.put('/customer-change-profile-picture', customerAuthentication.validateCustomerToken, customerMulter.upload, (req, res) => {
    return customerLoginController.changeCustomerPicture(req, res);
});

router.post('/customer-feedback', customerAuthentication.validateCustomerToken, (req, res) => {
    return customerLoginController.feedbackCustomer(req, res);
});

router.put('/customer-toggle-notification', customerAuthentication.validateCustomerToken, (req, res) => {
    return customerLoginController.toggleNotification(req, res);
});

router.get('/get-notification-status', customerAuthentication.validateCustomerToken, (req, res) => {
    return customerLoginController.getNotificationStatus(req, res);
});

router.delete('/customer-logout', (req, res) => {
    return customerLoginController.logoutCustomer(req, res);
});



//Hotspot Locations Routes


router.get('/get-hotspot-location', customerAuthentication.validateCustomerToken, (req, res) => {
    return HotspotLocationController.getHotspotLocation(req, res);
});

router.get('/check-hotspot-location', customerAuthentication.validateCustomerToken, (req, res) => {
    return HotspotLocationController.checkHotspotLocation(req, res);
});

router.get('/get-hotspot-dropoff', customerAuthentication.validateCustomerToken, (req, res) => {
    return HotspotLocationController.getHotspotDropoff(req, res);
});

router.get('/get-address-dropoff', customerAuthentication.validateCustomerToken, (req, res) => {
    return HotspotLocationController.getAddressDropoff(req, res);
});

router.get('/set-default-dropoff', customerAuthentication.validateCustomerToken, (req, res) => {
    return HotspotLocationController.setDefaultDropoff(req, res);
});

router.get('/get-default-hotspot', customerAuthentication.validateCustomerToken, (req, res) => {
    return HotspotLocationController.getDefaultHotspot(req, res);
});




//Restaurants Routes

router.get('/get-restaurant', customerAuthentication.validateCustomerToken, (req, res) => {
    return RestaurantController.getRestaurant(req, res);
});

router.get('/get-hotspot-restaurant', customerAuthentication.validateCustomerToken, (req, res) => {
    return RestaurantController.getHotspotRestaurant(req, res);
});

router.post('/set-favorite-restaurant', customerAuthentication.validateCustomerToken, (req, res) => {
    return RestaurantController.setFavoriteRestaurant(req, res);
});

router.get('/get-favorite-restaurant', customerAuthentication.validateCustomerToken, (req, res) => {
    return RestaurantController.getFavoriteRestaurant(req, res);
});

router.get('/get-food-category', customerAuthentication.validateCustomerToken, (req, res) => {
    return RestaurantController.getFoodCategory(req, res);
});

router.get('/get-restaurant-category', customerAuthentication.validateCustomerToken, (req, res) => {
    return RestaurantController.getRestaurantCategory(req, res);
});

router.get('/get-search-suggestion', customerAuthentication.validateCustomerToken, (req, res) => {
    return RestaurantController.getSearchSuggestion(req, res);
});

router.get('/get-search-result', customerAuthentication.validateCustomerToken, (req, res) => {
    return RestaurantController.getSearchResult(req, res);
});

router.post('/get-hotspot-restaurant-with-filter', customerAuthentication.validateCustomerToken, (req, res) => {
    return RestaurantController.getHotspotRestaurantWithFilter(req, res);
});

router.post('/get-hotspot-restaurant-pickup', customerAuthentication.validateCustomerToken, (req, res) => {
    return RestaurantController.getHotspotRestaurantPickup(req, res);
});

router.post('/get-hotspot-restaurant-delivery', customerAuthentication.validateCustomerToken, (req, res) => {
    return RestaurantController.getHotspotRestaurantDelivery(req, res);
});

router.get('/get-hotspot-restaurant-with-quick-filter', customerAuthentication.validateCustomerToken, (req, res) => {
    return RestaurantController.getHotspotRestaurantWithQuickFilter(req, res);
});

router.get('/get-offer-banner', customerAuthentication.validateCustomerToken, (req, res) => {
    return RestaurantController.getOfferBanner(req, res);
});

router.get('/get-restaurant-details', customerAuthentication.validateCustomerToken, (req, res) => {
    return RestaurantController.getRestaurantDetails(req, res);
})

router.get('/get-restaurant-schedule', customerAuthentication.validateCustomerToken, (req, res) => {
    return RestaurantController.getRestaurantSchedule(req, res);
})


//Foods Routes

router.get('/get-food-card-details', customerAuthentication.validateCustomerToken, (req, res) => {
    return RestaurantController.getFoodCardDetails(req, res);
})

router.put('/set-favorite-food', customerAuthentication.validateCustomerToken, (req, res) => {
    return RestaurantController.setFavoriteFood(req, res);
})

router.get('/get-favorite-food', customerAuthentication.validateCustomerToken, (req, res) => {
    return RestaurantController.getFavoriteFood(req, res);
})

router.get('/get-food-details/:restaurant_dish_id', customerAuthentication.validateCustomerToken, (req, res) => {
    return RestaurantController.getFoodDetails(req, res);
})

router.get('/get-recomended-slides', customerAuthentication.validateCustomerToken, (req, res) => {
    return RestaurantController.getRecomendedSlide(req, res);
})


//Orders routes
router.post('/add-to-cart', customerAuthentication.validateCustomerToken, (req, res) => {
    return OrderController.addToCart(req, res);
})

router.get('/get-cart/:restaurant_id/:order_type', customerAuthentication.validateCustomerToken, (req, res) => {
    return OrderController.getCart(req, res);
})

router.delete('/delete-from-cart/:restaurantDishId', customerAuthentication.validateCustomerToken, (req, res) => {
    return OrderController.deleteFromCart(req, res);
})

router.post('/create-order', customerAuthentication.validateCustomerToken, (req, res) => {
    return OrderController.createOrder(req, res);
})

router.get('/get-pre-order-info/:orderId', customerAuthentication.validateCustomerToken, (req, res) => {
    return OrderController.getPreOrderInfo(req, res);
})

router.put('/set-pickup-time/:orderId', customerAuthentication.validateCustomerToken, (req, res) => {
    return OrderController.setPickupTime(req, res);
})

router.put('/confirm-order-payment/:orderId', customerAuthentication.validateCustomerToken, (req, res) => {
    return OrderController.confirmOrderPayment(req, res);
})

router.get('/get-orders', customerAuthentication.validateCustomerToken, (req, res) => {
    return OrderController.getOrders(req, res);
})

router.get('/get-order-details/:orderId', customerAuthentication.validateCustomerToken, (req, res) => {
    return OrderController.getOrderDetails(req, res);
})

router.get('/get-track-status/:orderId', customerAuthentication.validateCustomerToken, (req, res) => {
    return OrderController.getTrackStatusOfOrder(req, res);
})




//payment routes
router.post('/add-payment-card', customerAuthentication.validateCustomerToken, (req, res) => {
    return PaymentController.addPaymentCard(req, res);
})

router.put('/update-payment-card/:payment_card_id', customerAuthentication.validateCustomerToken, (req, res) => {
    return PaymentController.updatePaymentCard(req, res);
})

router.get('/get-payment-card/:payment_card_id', customerAuthentication.validateCustomerToken, (req, res) => {
    return PaymentController.getPaymentCard(req, res);
})

router.get('/get-payment-cards', customerAuthentication.validateCustomerToken, (req, res) => {
    return PaymentController.getPaymentCards(req, res);
})

router.put('/set-default-payment-card/:payment_card_id', customerAuthentication.validateCustomerToken, (req, res) => {
    return PaymentController.setDefaultPaymentCard(req, res);
})

router.delete('/delete-payment-card/:payment_card_id', customerAuthentication.validateCustomerToken, (req, res) => {
    return PaymentController.deletePaymentCard(req, res);
})

router.post('/payment',customerAuthentication.validateCustomerToken, (req, res) => {
    return PaymentController.payment(req, res);
})

router.put('/save-payment-info',customerAuthentication.validateCustomerToken, (req, res) => {
    return PaymentController.savePaymentInfo(req, res);
})


module.exports=router;
