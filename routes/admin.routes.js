const express = require('express');
const router=express.Router();
const { check, body, query, param, oneOf, validationResult } = require('express-validator');

const joiValidation = require("../middlewares/joi");
const apiSchema = require("../apiSchema/adminSchema");

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

router.get('/htmlFileUrlToTextConvert', adminAuthentication.validateAdminToken, adminLoginController.htmlFileUrlToTextConvert);

//for image upload
router.put('/uploadImage',adminAuthentication.validateAdminToken, adminMulter.upload, adminLoginController.uploadImage);


//Restaurant Management

router.get('/restaurantCategoryList',adminAuthentication.validateAdminToken, adminRestaurantController.restaurantCategoryList);

router.post('/addRestaurant',adminAuthentication.validateAdminToken, adminRestaurantController.addRestaurant);

router.get('/listRestaurant',adminAuthentication.validateAdminToken, adminRestaurantController.listRestaurant);

router.put('/changeRestaurantStatus/:restaurantId',adminAuthentication.validateAdminToken, adminRestaurantController.changeRestaurantStatus);

router.get('/getRestaurant/:restaurantId',adminAuthentication.validateAdminToken, adminRestaurantController.getRestaurant);

router.put('/editRestaurant/:restaurantId',adminAuthentication.validateAdminToken, adminRestaurantController.editRestaurant);

router.delete('/deleteRestaurant/:restaurantId',adminAuthentication.validateAdminToken, adminRestaurantController.deleteRestaurant);

//router.put('/uploadRestaurantImage',adminAuthentication.validateAdminToken,adminMulter.upload, adminRestaurantController.uploadRestaurantImage);


//Menu Management

router.get('/dishCategoryList',adminAuthentication.validateAdminToken, adminRestaurantController.dishCategoryList);

router.post('/addDish',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.dishSchema), adminRestaurantController.addDish);

router.get('/getDish/:dishId',adminAuthentication.validateAdminToken, adminRestaurantController.getDish);

router.get('/listDishes',adminAuthentication.validateAdminToken, adminRestaurantController.listDishes);

router.put('/editDish/:dishId',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.dishSchema), adminRestaurantController.editDish);

router.delete('/deleteDish/:dishId',adminAuthentication.validateAdminToken, adminRestaurantController.deleteDish);

//router.put('/uploadDishImage',adminAuthentication.validateAdminToken, adminMulter.upload, adminRestaurantController.uploadDishImage);




//Customer Management

router.get('/listCustomers',adminAuthentication.validateAdminToken, adminCustomerController.listCustomers);

router.get('/viewCustomerProfile/:customerId',adminAuthentication.validateAdminToken, adminCustomerController.viewCustomerProfile);

router.put('/changeCustomerStatus/:customerId',adminAuthentication.validateAdminToken, adminCustomerController.changeCustomerStatus);

router.put('/editCustomer/:customerId',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.customerSchema), adminCustomerController.editCustomer);

//router.put('/uploadCustomerImage',adminAuthentication.validateAdminToken, adminMulter.upload, adminCustomerController.uploadCustomerImage);

router.delete('/deleteCustomer/:customerId',adminAuthentication.validateAdminToken, adminCustomerController.deleteCustomer);



//Dashboard Management

router.get('/getTotalCustomers',adminAuthentication.validateAdminToken, adminDashboardController.getTotalCustomers);

router.get('/getTotalRestaurants',adminAuthentication.validateAdminToken, adminDashboardController.getTotalRestaurants);

router.get('/getTotalDrivers',adminAuthentication.validateAdminToken, adminDashboardController.getTotalDrivers);

router.get('/getTotalOrders',adminAuthentication.validateAdminToken, adminDashboardController.getTotalOrders);

router.get('/getTotalRevenue',adminAuthentication.validateAdminToken, adminDashboardController.getTotalRevenue);

router.get('/getTotalRevenueByDate',adminAuthentication.validateAdminToken,joiValidation.validateQueryParams(apiSchema.dateSchema), adminDashboardController.getTotalRevenueByDate);


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


//Fee Settings

router.post('/addFee',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.feeSchema) ,adminFeeController.addFee);

router.put('/editFee/:feeId',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.feeSchema) , adminFeeController.editFee);

router.get('/getFeeList/:feeType',adminAuthentication.validateAdminToken, adminFeeController.getFeeList);

router.get('/getFee/:feeId',adminAuthentication.validateAdminToken, adminFeeController.getFee);


//schedule Settings

router.get('/listHotspots',adminAuthentication.validateAdminToken, adminHotspotController.listHotspots);

router.post('/addHotspot',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.hotspotSchema), adminHotspotController.addHotspot);

router.put('/editHotspot/:hotspotLocationId',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.hotspotSchema), adminHotspotController.editHotspot);

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

router.get('/getFaqs',adminAuthentication.validateAdminToken, staticContentController.getFaqs);
router.get('/getFaqQuestions',adminAuthentication.validateAdminToken,joiValidation.validateQueryParams(apiSchema.getFaqQuestions), staticContentController.getFaqQuestions);
router.post('/addFaq',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.addFaq), staticContentController.addFaq);
router.post('/deleteFaq',adminAuthentication.validateAdminToken, joiValidation.validateBody(apiSchema.deleteFaq),staticContentController.deleteFaq)
router.put('/editFaq/:topic_id',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.editFaq), staticContentController.editFaq)

module.exports = router;