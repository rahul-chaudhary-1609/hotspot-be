const express = require('express');

const joiValidation = require("../middlewares/joi");
const apiSchema = require("../apiSchema/driverSchema");
const adminMulter = require('../middlewares/multer');

const driverAuthentication = require('../middlewares/jwt');
const router=express.Router();
const {parseStringToArray}=require('../middlewares/validators')

const loginController = require('../controllers/driver/login');
const earningController  = require('../controllers/driver/earning');

const staticContentController = require('../controllers/driver/static_content');
const homeController = require('../controllers/driver/home');

// on boarding API's
router.post('/login',joiValidation.validateBody(apiSchema.login), loginController.login);
router.post('/forgotPassword',joiValidation.validateBody(apiSchema.forgotPassword), loginController.forgotPassword);
router.post('/verifyOTP',joiValidation.validateBody(apiSchema.verifyOTP), loginController.verifyOTP);
router.post('/resetPassword', joiValidation.validateBody(apiSchema.resetPassword), loginController.resetPassword);
router.post('/changePassword', driverAuthentication.validateDriverToken, joiValidation.validateBody(apiSchema.changePassword), loginController.changePassword);
router.post('/signUp',  joiValidation.validateBody(apiSchema.signUp), loginController.signUp);
router.post('/signUpDetailsStep1', joiValidation.validateBody(apiSchema.signUpDetailsStep1), loginController.signUpDetailsStep1);
router.post('/signUpDetailsStep2', joiValidation.validateBody(apiSchema.signUpDetailsStep2), loginController.signUpDetailsStep2);
router.post('/signUpDetailsStep3', joiValidation.validateBody(apiSchema.signUpDetailsStep3), loginController.signUpDetailsStep3);
router.put('/updateDeviceToken',driverAuthentication.validateDriverToken, joiValidation.validateBody(apiSchema.updateDeviceToken), loginController.updateDeviceToken);
router.get('/logout', driverAuthentication.validateDriverToken, loginController.logout);

//for image upload
router.post('/uploadFile', adminMulter.upload, loginController.uploadFile);


// accounts API's
router.get('/getDriverAccount', driverAuthentication.validateDriverToken, loginController.getDriverAccount);
router.get('/checkPhoneUpdate', driverAuthentication.validateDriverToken,joiValidation.validateQueryParams(apiSchema.checkPhoneUpdate), loginController.checkPhoneUpdate);
router.put('/editDriverAccount', driverAuthentication.validateDriverToken, joiValidation.validateBody(apiSchema.editDriverAccount), loginController.editDriverAccount);
router.put('/toggleNotification', driverAuthentication.validateDriverToken, joiValidation.validateBody(apiSchema.toggleNotification), loginController.toggleNotification);


// statticContent API's
router.get('/getStaticContent/:type',driverAuthentication.validateDriverToken, joiValidation.validateParams(apiSchema.getStaticContent),staticContentController.getStaticContent);
router.get('/getFaqTopics',driverAuthentication.validateDriverToken, staticContentController.getFaqTopics);
router.get('/getFaqs',driverAuthentication.validateDriverToken, joiValidation.validateQueryParams(apiSchema.getFaqs), staticContentController.getFaqs);
router.get('/htmlFileUrlToTextConvert',driverAuthentication.validateDriverToken, staticContentController.htmlFileUrlToTextConvert);


// home API's
router.get('/getPickupCards', driverAuthentication.validateDriverToken,joiValidation.validateQueryParams(apiSchema.getPickupCards) ,homeController.getPickupCards);
router.get('/getPickupDetails/:pickup_id', driverAuthentication.validateDriverToken,joiValidation.validateParams(apiSchema.getPickupDetails), homeController.getPickupDetails);
router.put('/confirmPickup/:pickup_id',driverAuthentication.validateDriverToken,joiValidation.validateParams(apiSchema.confirmPickup), homeController.confirmPickup);
router.get('/getDeliveryCards', driverAuthentication.validateDriverToken,joiValidation.validateQueryParams(apiSchema.getDeliveryCards) ,homeController.getDeliveryCards);
router.get('/getDeliveryDetails/:delivery_id', driverAuthentication.validateDriverToken,joiValidation.validateParams(apiSchema.getDeliveryDetails), homeController.getDeliveryDetails);
router.get('/getOrdersByDropOffId',driverAuthentication.validateDriverToken, joiValidation.validateQueryParams(apiSchema.getOrdersByDropOffId) ,homeController.getOrdersByDropOffId);
router.put('/confirmDelivery',driverAuthentication.validateDriverToken, parseStringToArray ,joiValidation.validateBody(apiSchema.confirmDelivery), homeController.confirmDelivery);

// earning API's
router.get('/getPendingEarning', driverAuthentication.validateDriverToken, joiValidation.validateQueryParams(apiSchema.getPendingEarning), earningController.getPendingEarning);
router.get('/getCollectedEarning', driverAuthentication.validateDriverToken, joiValidation.validateQueryParams(apiSchema.getCollectedEarning), earningController.getCollectedEarning);
router.get('/getDeliveryHistory', driverAuthentication.validateDriverToken, joiValidation.validateQueryParams(apiSchema.getDeliveryHistory), earningController.getDeliveryHistory);
router.get('/getDeliveryEarningDetails/:delivery_id', driverAuthentication.validateDriverToken, joiValidation.validateParams(apiSchema.getDeliveryEarningDetails), earningController.getDeliveryEarningDetails);


module.exports = router;