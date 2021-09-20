const express = require('express');
const router=express.Router();

const joiValidation = require("../middlewares/joi");
const apiSchema = require("../apiSchema/adminSchema");
const {parseStringToArray}=require('../middlewares/validators')

const adminLoginController = require('../controllers/admin/login');
const adminRestaurantController = require('../controllers/admin/restaurant');
const adminCustomerController = require('../controllers/admin/customer');
const adminDashboardController = require('../controllers/admin/dashboard');
const adminDriverController = require('../controllers/admin/driver');
const adminOrderController = require('../controllers/admin/order');
const adminFeeController = require('../controllers/admin/fee');
const adminHotspotController = require('../controllers/admin/hotspot');
const notificationController = require('../controllers/admin/notification');
const staticContentController = require('../controllers/admin/static_content');
const bannerController = require('../controllers/admin/banner');
const earningController = require('../controllers/admin/earning');
const paymentController = require('../controllers/admin/payment');

const adminAuthentication = require('../middlewares/jwt');
const adminMulter = require('../middlewares/multer');


// on boarding API's
router.post('/login',joiValidation.validateBody(apiSchema.login), adminLoginController.login);

router.post('/addNewAdmin',joiValidation.validateBody(apiSchema.addNewAdmin), adminLoginController.addNewAdmin);

router.post('/forgotPassword',joiValidation.validateBody(apiSchema.forgetPassword), adminLoginController.forgotPassword);

router.post('/resetPassword',joiValidation.validateBody(apiSchema.resetPassword), adminLoginController.resetPassword);

router.get('/logout', adminAuthentication.validateAdminToken, adminLoginController.logout);

router.post('/changePassword', adminAuthentication.validateAdminToken, joiValidation.validateBody(apiSchema.changePassword), adminLoginController.changePassword);

router.post('/updateProfile', adminAuthentication.validateAdminToken, joiValidation.validateBody(apiSchema.updateProfile), adminLoginController.updateProfile);

router.get('/getAdminProfile', adminAuthentication.validateAdminToken, adminLoginController.getAdminProfile);

router.get('/htmlFileUrlToTextConvert',  adminLoginController.htmlFileUrlToTextConvert);

//for image upload
router.put('/uploadFile',adminAuthentication.validateAdminToken, adminMulter.upload, adminLoginController.uploadImage);


//Restaurant Management

router.get('/restaurantCategoryList',adminAuthentication.validateAdminToken, adminRestaurantController.restaurantDishCategoryList);
router.post('/addRestaurant',adminAuthentication.validateAdminToken,parseStringToArray,joiValidation.validateBody(apiSchema.restaurantSchema), adminRestaurantController.addRestaurant);
router.get('/listRestaurant',adminAuthentication.validateAdminToken, adminRestaurantController.listRestaurant);
router.put('/changeRestaurantStatus/:restaurantId',adminAuthentication.validateAdminToken,joiValidation.validateParams(apiSchema.restaurantIdSchema), adminRestaurantController.changeRestaurantStatus);
router.get('/getRestaurant/:restaurantId',adminAuthentication.validateAdminToken, joiValidation.validateParams(apiSchema.restaurantIdSchema),adminRestaurantController.getRestaurant);
router.put('/editRestaurant/:restaurantId',adminAuthentication.validateAdminToken,parseStringToArray,joiValidation.validateParams(apiSchema.restaurantIdSchema),joiValidation.validateBody(apiSchema.restaurantSchema), adminRestaurantController.editRestaurant);
router.delete('/deleteRestaurant/:restaurantId',adminAuthentication.validateAdminToken, joiValidation.validateParams(apiSchema.restaurantIdSchema),adminRestaurantController.deleteRestaurant);

//Restaurant dish Category Management

router.post('/addRestaurantDishCategory',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.addRestaurantDishCategory), adminRestaurantController.addRestaurantDishCategory);
router.put('/editRestaurantDishCategory',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.editRestaurantDishCategory), adminRestaurantController.editRestaurantDishCategory);
router.get('/listRestaurantDishCategories',adminAuthentication.validateAdminToken,joiValidation.validateQueryParams(apiSchema.listRestaurantDishCategories), adminRestaurantController.listRestaurantDishCategories);
router.get('/getRestaurantDishCategory/:category_id',adminAuthentication.validateAdminToken, joiValidation.validateParams(apiSchema.getRestaurantDishCategory),adminRestaurantController.getRestaurantDishCategory);
router.delete('/deleteRestaurantDishCategory',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.deleteRestaurantDishCategory), adminRestaurantController.deleteRestaurantDishCategory);
router.put('/toggleRestaurantDishCategoryStatus',adminAuthentication.validateAdminToken, joiValidation.validateBody(apiSchema.toggleRestaurantDishCategoryStatus),adminRestaurantController.toggleRestaurantDishCategoryStatus);


//Menu Management

router.get('/dishCategoryList',adminAuthentication.validateAdminToken, adminRestaurantController.dishCategoryList);
router.post('/addDish',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.addDish), adminRestaurantController.addDish);
router.get('/getDish/:dishId',adminAuthentication.validateAdminToken, joiValidation.validateParams(apiSchema.getDish),adminRestaurantController.getDish);
router.get('/listDishes',adminAuthentication.validateAdminToken,joiValidation.validateQueryParams(apiSchema.listDishes), adminRestaurantController.listDishes);
router.put('/editDish',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.editDish), adminRestaurantController.editDish);
router.delete('/deleteDish/:dishId',adminAuthentication.validateAdminToken,joiValidation.validateParams(apiSchema.deleteDish), adminRestaurantController.deleteDish);
router.put('/toggleDishAsRecommended',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.toggleDishAsRecommended), adminRestaurantController.toggleDishAsRecommended);
router.put('/toggleDishAsQuickFilter',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.toggleDishAsQuickFilter), adminRestaurantController.toggleDishAsQuickFilter);


//Dish add on section Management

router.post('/addDishAddOnSection',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.addDishAddOnSection), adminRestaurantController.addDishAddOnSection);
router.put('/editDishAddOnSection',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.editDishAddOnSection), adminRestaurantController.editDishAddOnSection);
router.get('/listDishAddOnSections',adminAuthentication.validateAdminToken,joiValidation.validateQueryParams(apiSchema.listDishAddOnSections), adminRestaurantController.listDishAddOnSections);
router.get('/getDishAddOnSection/:category_id',adminAuthentication.validateAdminToken, joiValidation.validateParams(apiSchema.getDishAddOnSection),adminRestaurantController.getDishAddOnSection);
router.delete('/deleteDishAddOnSection',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.deleteDishAddOnSection), adminRestaurantController.deleteDishAddOnSection);
router.put('/toggleDishAddOnSectionStatus',adminAuthentication.validateAdminToken, joiValidation.validateBody(apiSchema.toggleDishAddOnSectionStatus),adminRestaurantController.toggleDishAddOnSectionStatus);


//Dish Addon Management

router.post('/addDishAddon',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.addDishAddon), adminRestaurantController.addDishAddon);
router.get('/getDishAddonById/:dish_addon_id',adminAuthentication.validateAdminToken, joiValidation.validateParams(apiSchema.getDishAddonById),adminRestaurantController.getDishAddonById);
router.get('/listDishAddon',adminAuthentication.validateAdminToken,joiValidation.validateQueryParams(apiSchema.listDishAddon), adminRestaurantController.listDishAddon);
router.put('/editDishAddon',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.editDishAddon), adminRestaurantController.editDishAddon);
router.delete('/deleteDishAddon/:dish_addon_id',adminAuthentication.validateAdminToken,joiValidation.validateParams(apiSchema.deleteDishAddon), adminRestaurantController.deleteDishAddon);


//Customer Management

router.get('/listCustomers',adminAuthentication.validateAdminToken, adminCustomerController.listCustomers);

router.get('/viewCustomerProfile/:customerId',adminAuthentication.validateAdminToken, adminCustomerController.viewCustomerProfile);

router.put('/changeCustomerStatus/:customerId',adminAuthentication.validateAdminToken, adminCustomerController.changeCustomerStatus);

router.put('/editCustomer/:customerId',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.customerSchema), adminCustomerController.editCustomer);

router.delete('/deleteCustomer/:customerId',adminAuthentication.validateAdminToken, adminCustomerController.deleteCustomer);



//Dashboard Management

router.get('/listAllHotspot', adminAuthentication.validateAdminToken, adminDashboardController.listAllHotspot);

router.get('/getTotalCustomers',adminAuthentication.validateAdminToken, adminDashboardController.getTotalCustomers);

router.get('/getCustomersViaHotspot/:hotspot_id',adminAuthentication.validateAdminToken, adminDashboardController.getCustomersViaHotspot);

router.get('/getTotalRestaurants',adminAuthentication.validateAdminToken, adminDashboardController.getTotalRestaurants);

router.get('/getTotalDrivers',adminAuthentication.validateAdminToken, adminDashboardController.getTotalDrivers);

router.get('/getDriversViaHotspot/:hotspot_id',adminAuthentication.validateAdminToken, adminDashboardController.getDriversViaHotspot);

router.get('/getTotalOrders',adminAuthentication.validateAdminToken, adminDashboardController.getTotalOrders);

router.get('/getHotspotCount',adminAuthentication.validateAdminToken, adminDashboardController.getHotspotCount);

router.get('/getOrdersViaHotspot/:hotspot_id',adminAuthentication.validateAdminToken, adminDashboardController.getOrdersViaHotspot);

router.get('/getProcessingOrdersViaHotspot/:hotspot_id',adminAuthentication.validateAdminToken, adminDashboardController.getProcessingOrdersViaHotspot);

router.get('/getCompletedOrdersViaHotspot/:hotspot_id',adminAuthentication.validateAdminToken, adminDashboardController.getCompletedOrdersViaHotspot);

router.get('/getProcessingOrders',adminAuthentication.validateAdminToken, adminDashboardController.getProcessingOrders);

router.get('/getCompletedOrder',adminAuthentication.validateAdminToken, adminDashboardController.getCompletedOrders);

router.get('/getTotalRevenue',adminAuthentication.validateAdminToken, adminDashboardController.getTotalRevenue);

router.get('/getTotalRevenueByDate',adminAuthentication.validateAdminToken,joiValidation.validateQueryParams(apiSchema.dateSchema), adminDashboardController.getTotalRevenueByDate);

router.get('/getOrderStats',adminAuthentication.validateAdminToken,adminDashboardController.getOrderStats);

router.get('/getTotalRevenueViaHotspot/:hotspot_id', adminAuthentication.validateAdminToken,adminDashboardController.getTotalRevenueViaHotspot);

router.get('/getRevenueStats',adminAuthentication.validateAdminToken,adminDashboardController.getRevenueStats);



//Driver Management

router.get('/listDrivers',adminAuthentication.validateAdminToken, adminDriverController.listDrivers);

router.get('/getDriverDetails/:driverId',adminAuthentication.validateAdminToken, adminDriverController.getDriverDetails);

router.get('/getDriverEarningDetails',adminAuthentication.validateAdminToken, joiValidation.validateQueryParams(apiSchema.getDriverEarningDetails), adminDriverController.getDriverEarningDetails);

router.put('/approveDriver/:driverId',adminAuthentication.validateAdminToken, adminDriverController.approveDriver);

router.put('/changeDriverStatus/:driverId',adminAuthentication.validateAdminToken, adminDriverController.changeDriverStatus);

// router.put('/uploadDriverProfileImage',adminAuthentication.validateAdminToken, adminMulter.upload, adminDriverController.uploadDriverProfileImage);

// router.put('/uploadVehicleImage',adminAuthentication.validateAdminToken, adminMulter.upload, adminDriverController.uploadVehicleImage);

// router.put('/uploadLicenseImage',adminAuthentication.validateAdminToken, adminMulter.upload, adminDriverController.uploadLicenseImage);

// router.put('/uploadInsuranceImage',adminAuthentication.validateAdminToken, adminMulter.upload, adminDriverController.uploadInsuranceImage);

router.put('/editDriver/:driverId',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.driverSchema), adminDriverController.editDriver);

router.get('/addDrivers',adminDriverController.addDrivers);


//order Management

router.get('/getActiveOrders',adminAuthentication.validateAdminToken, adminOrderController.getActiveOrders);

router.get('/getScheduledOrders',adminAuthentication.validateAdminToken, adminOrderController.getScheduledOrders);

router.get('/getCompletedOrders',adminAuthentication.validateAdminToken, adminOrderController.getCompletedOrders);

router.get('/getOrderDetails/:orderId',adminAuthentication.validateAdminToken, adminOrderController.getOrderDetails);

router.put('/assignDriver/:orderId',adminAuthentication.validateAdminToken, adminOrderController.assignDriver);

router.get('/getDriverListByHotspot',adminAuthentication.validateAdminToken,joiValidation.validateQueryParams(apiSchema.getDriverListByHotspot), adminOrderController.getDriverListByHotspot);


//Fee Settings

router.post('/addDriverFee',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.addDriverFee) ,adminFeeController.addDriverFee);

router.put('/editDriverFee',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.editDriverFee) , adminFeeController.editDriverFee);

router.get('/getDriverFeeList',adminAuthentication.validateAdminToken, adminFeeController.getDriverFeeList);

router.get('/getDriverFeeById/:fee_id',adminAuthentication.validateAdminToken,joiValidation.validateParams(apiSchema.getDriverFeeById), adminFeeController.getDriverFeeById);

router.put('/editRestaurantFee',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.editRestaurantFee) , adminFeeController.editRestaurantFee);

router.delete('/deleteDriverFee/:fee_id',adminAuthentication.validateAdminToken,joiValidation.validateParams(apiSchema.deleteDriverFee), adminFeeController.deleteDriverFee);

router.get('/listTip', adminAuthentication.validateAdminToken, adminFeeController.listTip);

router.get('/getTipById/:tip_id',adminAuthentication.validateAdminToken,joiValidation.validateParams(apiSchema.getTipById), adminFeeController.getTipById);

router.put('/editTip',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.editTip) , adminFeeController.editTip);


//schedule Settings

router.get('/listAllRestaurant', adminAuthentication.validateAdminToken, adminHotspotController.listAllRestaurant);

router.get('/listAllDriver', adminAuthentication.validateAdminToken, adminHotspotController.listAllDriver);

router.get('/listHotspots',adminAuthentication.validateAdminToken, adminHotspotController.listHotspots);

router.post('/addHotspot',adminAuthentication.validateAdminToken,parseStringToArray,joiValidation.validateBody(apiSchema.hotspotSchema), adminHotspotController.addHotspot);

router.put('/editHotspot/:hotspotLocationId',adminAuthentication.validateAdminToken,parseStringToArray,joiValidation.validateBody(apiSchema.hotspotSchema), adminHotspotController.editHotspot);

router.get('/getHotspotDetails/:hotspotLocationId',adminAuthentication.validateAdminToken, adminHotspotController.getHotspotDetails);

router.delete('/deleteHotspot/:hotspotLocationId',adminAuthentication.validateAdminToken, adminHotspotController.deleteHotspot);


// notification management
router.post('/addNotification',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.addNotification), notificationController.addNotification);
router.get('/getNotifications',adminAuthentication.validateAdminToken, notificationController.getNotifications);
router.get('/getNotificationDetails',adminAuthentication.validateAdminToken, joiValidation.validateQueryParams(apiSchema.getNotificationDetails), notificationController.getNotificationDetails);
router.delete('/deleteNotification',adminAuthentication.validateAdminToken, joiValidation.validateQueryParams(apiSchema.deleteNotification), notificationController.deleteNotification);

// static content management
router.get('/getStaticContents',adminAuthentication.validateAdminToken, staticContentController.getStaticContents);
router.get('/getStaticContentDetails',adminAuthentication.validateAdminToken,joiValidation.validateQueryParams(apiSchema.getStaticContentDetails), staticContentController.getStaticContentDetails);
router.post('/updateStaticContent',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.updateStaticContent), staticContentController.updateStaticContent);

router.post('/addFaq',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.addFaq), staticContentController.addFaq);
router.get('/getFaqTopics', adminAuthentication.validateAdminToken, staticContentController.getFaqTopics);
router.get('/getFaqTopicById/:topic_id',adminAuthentication.validateAdminToken,joiValidation.validateParams(apiSchema.getFaqTopicById), staticContentController.getFaqTopicById);
router.put('/editFaqTopic', adminAuthentication.validateAdminToken, joiValidation.validateBody(apiSchema.editFaqTopic), staticContentController.editFaqTopic);
router.delete('/deleteFaqTopic/:topic_id',adminAuthentication.validateAdminToken,joiValidation.validateParams(apiSchema.deleteFaqTopic), staticContentController.deleteFaqTopic);
router.get('/getFaqQuestions', adminAuthentication.validateAdminToken, joiValidation.validateQueryParams(apiSchema.getFaqQuestions), staticContentController.getFaqQuestions);
router.get('/getFaqQuestionById/:id',adminAuthentication.validateAdminToken,joiValidation.validateParams(apiSchema.getFaqQuestionById), staticContentController.getFaqQuestionById);
router.put('/editFaqQuestion', adminAuthentication.validateAdminToken, joiValidation.validateBody(apiSchema.editFaqQuestion), staticContentController.editFaqQuestion);
router.delete('/deleteFaqQuestion/:id',adminAuthentication.validateAdminToken,joiValidation.validateParams(apiSchema.deleteFaqQuestion), staticContentController.deleteFaqQuestion);

// Banner api's
router.get('/listBanners',adminAuthentication.validateAdminToken, bannerController.listBanners);
router.post('/addBanner',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.addBanner),bannerController.addBanner);
router.put('/editBanner/:banner_id',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.editBanner),bannerController.editBanner);
router.delete('/deleteBanner/:banner_id',adminAuthentication.validateAdminToken, bannerController.deleteBanner)
router.get('/getBanner/:banner_id', adminAuthentication.validateAdminToken, bannerController.getBanner)
router.put('/updateBannerOrder',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.updateBannerOrder),bannerController.updateBannerOrder);
module.exports = router;


//earming Management
router.get('/getOrderDeliveries',adminAuthentication.validateAdminToken,joiValidation.validateQueryParams(apiSchema.getOrderDeliveries), earningController.getOrderDeliveries);
router.get('/getOrderDeliveryDetails',adminAuthentication.validateAdminToken,joiValidation.validateQueryParams(apiSchema.getOrderDeliveryDetails), earningController.getOrderDeliveryDetails);
router.get('/getPickupOrders',adminAuthentication.validateAdminToken,joiValidation.validateQueryParams(apiSchema.getPickupOrders), earningController.getPickupOrders);
router.get('/getRestaurantEarnings',adminAuthentication.validateAdminToken,joiValidation.validateQueryParams(apiSchema.getRestaurantEarnings), earningController.getRestaurantEarnings);
router.get('/getOrdersByRestaurantIdAndDateRange',adminAuthentication.validateAdminToken,joiValidation.validateQueryParams(apiSchema.getOrdersByRestaurantIdAndDateRange), earningController.getOrdersByRestaurantIdAndDateRange);
router.get('/getDriverEarnings',adminAuthentication.validateAdminToken,joiValidation.validateQueryParams(apiSchema.getDriverEarnings), earningController.getDriverEarnings);
router.get('/getOrdersByDriverIdAndDateRange',adminAuthentication.validateAdminToken,joiValidation.validateQueryParams(apiSchema.getOrdersByDriverIdAndDateRange), earningController.getOrdersByDriverIdAndDateRange);
router.get('/getDriverPaymentDetails/:payment_id',adminAuthentication.validateAdminToken,joiValidation.validateParams(apiSchema.getDriverPaymentDetails), earningController.getDriverPaymentDetails);
router.get('/getRestaurantPaymentDetails/:payment_id',adminAuthentication.validateAdminToken,joiValidation.validateParams(apiSchema.getRestaurantPaymentDetails), earningController.getRestaurantPaymentDetails);

//payment management
router.post('/paymentDriver', adminAuthentication.validateAdminToken, joiValidation.validateBody(apiSchema.paymentDriver), paymentController.paymentDriver);
router.post('/driverPaymentSuccess', adminAuthentication.validateAdminToken, joiValidation.validateBody(apiSchema.driverPaymentSuccess), paymentController.driverPaymentSuccess);
router.post('/paymentRestaurant', adminAuthentication.validateAdminToken, joiValidation.validateBody(apiSchema.paymentRestaurant), paymentController.paymentRestaurant);
router.post('/restaurantPaymentSuccess', adminAuthentication.validateAdminToken, joiValidation.validateBody(apiSchema.restaurantPaymentSuccess), paymentController.restaurantPaymentSuccess);