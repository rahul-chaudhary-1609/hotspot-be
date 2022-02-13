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
const refundController = require('../controllers/admin/refund');

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

router.post('/addRestaurant',adminAuthentication.validateAdminToken,parseStringToArray,joiValidation.validateBody(apiSchema.addRestaurant), adminRestaurantController.addRestaurant);
router.get('/listRestaurant',adminAuthentication.validateAdminToken,joiValidation.validateQueryParams(apiSchema.listRestaurant), adminRestaurantController.listRestaurant);
router.put('/toggleRestaurantStatus',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.toggleRestaurantStatus), adminRestaurantController.toggleRestaurantStatus);
router.get('/getRestaurant/:restaurantId',adminAuthentication.validateAdminToken, joiValidation.validateParams(apiSchema.getRestaurant),adminRestaurantController.getRestaurant);
router.put('/editRestaurant',adminAuthentication.validateAdminToken,parseStringToArray,joiValidation.validateBody(apiSchema.editRestaurant), adminRestaurantController.editRestaurant);
router.delete('/deleteRestaurant',adminAuthentication.validateAdminToken, joiValidation.validateBody(apiSchema.deleteRestaurant),adminRestaurantController.deleteRestaurant);

//Restaurant dish Category Management

router.post('/addRestaurantDishCategory',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.addRestaurantDishCategory), adminRestaurantController.addRestaurantDishCategory);
router.put('/editRestaurantDishCategory',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.editRestaurantDishCategory), adminRestaurantController.editRestaurantDishCategory);
router.get('/listRestaurantDishCategories',adminAuthentication.validateAdminToken,joiValidation.validateQueryParams(apiSchema.listRestaurantDishCategories), adminRestaurantController.listRestaurantDishCategories);
router.get('/getRestaurantDishCategory/:category_id',adminAuthentication.validateAdminToken, joiValidation.validateParams(apiSchema.getRestaurantDishCategory),adminRestaurantController.getRestaurantDishCategory);
router.delete('/deleteRestaurantDishCategory',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.deleteRestaurantDishCategory), adminRestaurantController.deleteRestaurantDishCategory);
router.put('/toggleRestaurantDishCategoryStatus',adminAuthentication.validateAdminToken, joiValidation.validateBody(apiSchema.toggleRestaurantDishCategoryStatus),adminRestaurantController.toggleRestaurantDishCategoryStatus);


//Menu Management

router.post('/addDish',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.addDish), adminRestaurantController.addDish);
router.get('/getDish/:dishId',adminAuthentication.validateAdminToken, joiValidation.validateParams(apiSchema.getDish),adminRestaurantController.getDish);
router.get('/listDishes',adminAuthentication.validateAdminToken,joiValidation.validateQueryParams(apiSchema.listDishes), adminRestaurantController.listDishes);
router.put('/editDish',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.editDish), adminRestaurantController.editDish);
router.delete('/deleteDish',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.deleteDish), adminRestaurantController.deleteDish);
router.put('/toggleDishStatus',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.toggleDishStatus), adminRestaurantController.toggleDishStatus);
router.put('/toggleDishAsRecommended',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.toggleDishAsRecommended), adminRestaurantController.toggleDishAsRecommended);
router.put('/toggleDishAsQuickFilter',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.toggleDishAsQuickFilter), adminRestaurantController.toggleDishAsQuickFilter);


//Dish add on section Management

router.post('/addDishAddOnSection',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.addDishAddOnSection), adminRestaurantController.addDishAddOnSection);
router.put('/editDishAddOnSection',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.editDishAddOnSection), adminRestaurantController.editDishAddOnSection);
router.get('/listDishAddOnSections',adminAuthentication.validateAdminToken,joiValidation.validateQueryParams(apiSchema.listDishAddOnSections), adminRestaurantController.listDishAddOnSections);
router.get('/getDishAddOnSection/:section_id',adminAuthentication.validateAdminToken, joiValidation.validateParams(apiSchema.getDishAddOnSection),adminRestaurantController.getDishAddOnSection);
router.delete('/deleteDishAddOnSection',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.deleteDishAddOnSection), adminRestaurantController.deleteDishAddOnSection);
router.put('/toggleDishAddOnSectionStatus',adminAuthentication.validateAdminToken, joiValidation.validateBody(apiSchema.toggleDishAddOnSectionStatus),adminRestaurantController.toggleDishAddOnSectionStatus);


//Dish Addon Management

router.post('/addDishAddon',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.addDishAddon), adminRestaurantController.addDishAddon);
router.get('/getDishAddon/:dish_addon_id',adminAuthentication.validateAdminToken, joiValidation.validateParams(apiSchema.getDishAddon),adminRestaurantController.getDishAddon);
router.get('/listDishAddon',adminAuthentication.validateAdminToken,joiValidation.validateQueryParams(apiSchema.listDishAddon), adminRestaurantController.listDishAddon);
router.put('/editDishAddon',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.editDishAddon), adminRestaurantController.editDishAddon);
router.delete('/deleteDishAddon',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.deleteDishAddon), adminRestaurantController.deleteDishAddon);
router.put('/toggleDishAddonStatus',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.toggleDishAddonStatus), adminRestaurantController.toggleDishAddonStatus);


//Customer Management

router.get('/listCustomers',adminAuthentication.validateAdminToken, adminCustomerController.listCustomers);
router.get('/viewCustomerProfile/:customerId',adminAuthentication.validateAdminToken, adminCustomerController.viewCustomerProfile);
router.put('/changeCustomerStatus/:customerId',adminAuthentication.validateAdminToken, adminCustomerController.changeCustomerStatus);
router.put('/editCustomer/:customerId',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.customerSchema), adminCustomerController.editCustomer);
router.delete('/deleteCustomer/:customerId',adminAuthentication.validateAdminToken, adminCustomerController.deleteCustomer);
router.get('/listActiveCustomers',adminAuthentication.validateAdminToken, adminCustomerController.listActiveCustomers);
router.put('/addPromotionalCredits',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.addPromotionalCredits), adminCustomerController.addPromotionalCredits);


//Dashboard Management

router.get('/listAllHotspot', adminAuthentication.validateAdminToken, adminDashboardController.listAllHotspot);
router.get('/getSiteStatistics',adminAuthentication.validateAdminToken, joiValidation.validateQueryParams(apiSchema.getSiteStatistics),adminDashboardController.getSiteStatistics);
router.get('/getOrderStatistics',adminAuthentication.validateAdminToken, joiValidation.validateQueryParams(apiSchema.getOrderStatistics),adminDashboardController.getOrderStatistics);
router.get('/getOrderStats',adminAuthentication.validateAdminToken,joiValidation.validateQueryParams(apiSchema.getOrderStats),adminDashboardController.getOrderStats);
router.get('/getRevenueStats',adminAuthentication.validateAdminToken,joiValidation.validateQueryParams(apiSchema.getRevenueStats),adminDashboardController.getRevenueStats);



//Driver Management

router.get('/listDriver',adminAuthentication.validateAdminToken,joiValidation.validateQueryParams(apiSchema.listDriver), adminDriverController.listDriver);
router.get('/getDriverDetails/:driverId',adminAuthentication.validateAdminToken, adminDriverController.getDriverDetails);
router.get('/getDriverEarningDetails',adminAuthentication.validateAdminToken, joiValidation.validateQueryParams(apiSchema.getDriverEarningDetails), adminDriverController.getDriverEarningDetails);
router.put('/approveDriver/:driverId',adminAuthentication.validateAdminToken, adminDriverController.approveDriver);
router.put('/changeDriverStatus/:driverId',adminAuthentication.validateAdminToken, adminDriverController.changeDriverStatus);
router.put('/editDriver/:driverId',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.driverSchema), adminDriverController.editDriver);



//order Management

router.get('/getActiveOrders',adminAuthentication.validateAdminToken,joiValidation.validateQueryParams(apiSchema.getActiveOrders), adminOrderController.getActiveOrders);
router.get('/getScheduledOrders',adminAuthentication.validateAdminToken,joiValidation.validateQueryParams(apiSchema.getScheduledOrders), adminOrderController.getScheduledOrders);
router.get('/getCompletedOrders',adminAuthentication.validateAdminToken,joiValidation.validateQueryParams(apiSchema.getCompletedOrders), adminOrderController.getCompletedOrders);
router.get('/getOrderDetails/:orderId',adminAuthentication.validateAdminToken,joiValidation.validateParams(apiSchema.getOrderDetails), adminOrderController.getOrderDetails);
router.put('/assignDriver',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.assignDriver), adminOrderController.assignDriver);
router.put('/bulkAssignDriver',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.bulkAssignDriver), adminOrderController.bulkAssignDriver);
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
router.get('/listTax', adminAuthentication.validateAdminToken, adminFeeController.listTax);
router.get('/getTaxById/:tax_id',adminAuthentication.validateAdminToken,joiValidation.validateParams(apiSchema.getTaxById), adminFeeController.getTaxById);
router.put('/editTax',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.editTax) , adminFeeController.editTax);


//schedule Settings

router.get('/listAllRestaurant', adminAuthentication.validateAdminToken, adminHotspotController.listAllRestaurant);
router.get('/listAllDriver', adminAuthentication.validateAdminToken, adminHotspotController.listAllDriver);
router.get('/listHotspot',adminAuthentication.validateAdminToken,joiValidation.validateQueryParams(apiSchema.listHotspot), adminHotspotController.listHotspot);
router.post('/addHotspot',adminAuthentication.validateAdminToken,parseStringToArray,joiValidation.validateBody(apiSchema.addHotspot), adminHotspotController.addHotspot);
router.put('/editHotspot',adminAuthentication.validateAdminToken,parseStringToArray,joiValidation.validateBody(apiSchema.editHotspot), adminHotspotController.editHotspot);
router.get('/getHotspot/:hotspotLocationId',adminAuthentication.validateAdminToken,joiValidation.validateParams(apiSchema.getHotspot), adminHotspotController.getHotspot);
router.delete('/deleteHotspot',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.deleteHotspot), adminHotspotController.deleteHotspot);


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
router.post('/generateRestaurantEarnings',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.generateRestaurantEarnings), earningController.generateRestaurantEarnings);
router.post('/generateRestaurantOrderEmail',adminAuthentication.validateAdminToken,joiValidation.validateBody(apiSchema.generateRestaurantOrderEmail), earningController.generateRestaurantOrderEmail);
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

//refund management
router.get('/listOrderPayments', adminAuthentication.validateAdminToken, joiValidation.validateQueryParams(apiSchema.listOrderPayments), refundController.listOrderPayments);
router.get('/getOrderPaymentDetails/:payment_id', adminAuthentication.validateAdminToken, joiValidation.validateParams(apiSchema.getOrderPaymentDetails), refundController.getOrderPaymentDetails);
router.post('/refund', adminAuthentication.validateAdminToken, joiValidation.validateBody(apiSchema.refund), refundController.refund);
router.get('/listRefunds', adminAuthentication.validateAdminToken, joiValidation.validateQueryParams(apiSchema.listRefunds), refundController.listRefunds);
router.get('/getRefundDetails/:refund_id', adminAuthentication.validateAdminToken, joiValidation.validateParams(apiSchema.getRefundDetails), refundController.getRefundDetails);
router.get('/listRefundHistory', adminAuthentication.validateAdminToken, joiValidation.validateQueryParams(apiSchema.listRefundHistory), refundController.listRefundHistory);
router.get('/getRefundHistoryDetails/:customer_id', adminAuthentication.validateAdminToken, joiValidation.validateParams(apiSchema.getRefundHistoryDetails), refundController.getRefundHistoryDetails);
router.get('/listDisputes', adminAuthentication.validateAdminToken, joiValidation.validateQueryParams(apiSchema.listDisputes), refundController.listDisputes);
router.get('/getDisputeDetails/:dispute_id', adminAuthentication.validateAdminToken, joiValidation.validateParams(apiSchema.getDisputeDetails), refundController.getDisputeDetails);
router.put('/changeDisputeStatus', adminAuthentication.validateAdminToken, joiValidation.validateBody(apiSchema.changeDisputeStatus), refundController.changeDisputeStatus);
