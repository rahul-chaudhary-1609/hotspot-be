const express = require('express');

const joiValidation = require("../middlewares/joi");
const apiSchema = require("../apiSchema/driverSchema");

const driverAuthentication = require('../middlewares/jwt');
const router=express.Router();
const {parseStringToArray}=require('../middlewares/validators')

const onBoardingController = require('../controllers/driver/login');
const earningController  = require('../controllers/driver/earningController');

const accountController = require('../controllers/driver/account');
const staticContentController = require('../controllers/driver/staticContent');
const homeController = require('../controllers/driver/home');

// on boarding API's
router.post('/login',joiValidation.validateBody(apiSchema.login), onBoardingController.login);
router.post('/forgotPassword',joiValidation.validateBody(apiSchema.forgotPassword), onBoardingController.forgotPassword);
router.post('/verifyOTP',joiValidation.validateBody(apiSchema.verifyOTP), onBoardingController.verifyOTP);
router.post('/resetPassword', joiValidation.validateBody(apiSchema.resetPassword), onBoardingController.resetPassword);
router.post('/changePassword', driverAuthentication.validateDriverToken, joiValidation.validateBody(apiSchema.changePassword), onBoardingController.changePassword);
router.post('/signUp',  joiValidation.validateBody(apiSchema.signUp), onBoardingController.signUp);
router.post('/signUpDetailsStep1', driverAuthentication.validateDriverToken, joiValidation.validateBody(apiSchema.signUpDetailsStep1), onBoardingController.signUpDetailsStep1);
router.post('/signUpDetailsStep2', driverAuthentication.validateDriverToken, joiValidation.validateBody(apiSchema.signUpDetailsStep2), onBoardingController.signUpDetailsStep2);
router.post('/signUpDetailsStep3', driverAuthentication.validateDriverToken, joiValidation.validateBody(apiSchema.signUpDetailsStep3), onBoardingController.signUpDetailsStep3);
router.get('/logout', driverAuthentication.validateDriverToken, onBoardingController.logout);



// accounts API's
router.put('/editDriverPersonalDetails', driverAuthentication.validateDriverToken, joiValidation.validateBody(apiSchema.driverPersonalDetails), accountController.editDriverPersonalDetails);
router.get('/getDriverPersonalDetails', driverAuthentication.validateDriverToken, accountController.getDriverPersonalDetails);
router.put('/editDriverAddressDetails', driverAuthentication.validateDriverToken, joiValidation.validateBody(apiSchema.driverAddressDetails), accountController.editDriverAddressDetails);
router.get('/getDriverAddressDetails', driverAuthentication.validateDriverToken, accountController.getDriverAddressDetails);
router.put('/editDriverVehicleDetails', driverAuthentication.validateDriverToken, joiValidation.validateBody(apiSchema.driverVehicleDetails), accountController.editDriverVehicleDetails);
router.get('/getDriverVehicleDetails', driverAuthentication.validateDriverToken, accountController.getDriverVehicleDetails);
router.put('/editDriverBankDetails', driverAuthentication.validateDriverToken, joiValidation.validateBody(apiSchema.driverBankDetails), accountController.editDriverBankDetails);
router.get('/getDriverBankDetails', driverAuthentication.validateDriverToken, accountController.getDriverBankDetails);

// statticContent API's

router.get('/getSupportFaq/:topic_id', driverAuthentication.validateDriverToken, staticContentController.helpFaq);
router.get('/getStaticContent/:id', driverAuthentication.validateDriverToken, staticContentController.getStaticContent);

// home API's
router.get('/getPickupCards', driverAuthentication.validateDriverToken,joiValidation.validateQueryParams(apiSchema.getPickupCards) ,homeController.getPickupCards);
router.get('/getPickupDetails/:pickup_id', driverAuthentication.validateDriverToken,joiValidation.validateParams(apiSchema.getPickupDetails), homeController.getPickupDetails);
router.put('/confirmPickup/:pickup_id',driverAuthentication.validateDriverToken,joiValidation.validateParams(apiSchema.confirmPickup), homeController.confirmPickup);
router.get('/getDeliveryCards', driverAuthentication.validateDriverToken,joiValidation.validateQueryParams(apiSchema.getDeliveryCards) ,homeController.getDeliveryCards);
router.get('/getDeliveryDetails/:delivery_id', driverAuthentication.validateDriverToken,joiValidation.validateParams(apiSchema.getDeliveryDetails), homeController.getDeliveryDetails);
router.get('/getOrdersByDropOffId',driverAuthentication.validateDriverToken, joiValidation.validateQueryParams(apiSchema.getOrdersByDropOffId) ,homeController.getOrdersByDropOffId);
router.put('/confirmDelivery',driverAuthentication.validateDriverToken, parseStringToArray ,joiValidation.validateBody(apiSchema.confirmDelivery), homeController.confirmDelivery);

// earning API's
router.get('/getEarningList', driverAuthentication.validateDriverToken, joiValidation.validateQueryParams(apiSchema.getEarningList), earningController.getEarningList);
//router.get('/getEarningDetails', driverAuthentication.validateDriverToken, joiValidation.validateQueryParams(apiSchema.getEarningDetails), earningController.getEarningDetails);
router.get('/getTotalEarnings', driverAuthentication.validateDriverToken, joiValidation.validateQueryParams(apiSchema.getTotalEarnings), earningController.getTotalEarnings);
router.get('/getDeliveryHistory', driverAuthentication.validateDriverToken, joiValidation.validateQueryParams(apiSchema.getDeliveryHistory), earningController.getDeliveryHistory);
module.exports = router;