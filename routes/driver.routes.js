const express = require('express');

const joiValidation = require("../middlewares/joi");
const apiSchema = require("../apiSchema/driverSchema");

const driverAuthentication = require('../middlewares/jwt');
const router=express.Router();
const multer = require('../middlewares/multer');

const { OnBoardingController }   = require('../controllers/driver/onBoardingController');

const onBoardingController = new OnBoardingController(); 
const accountController = require('../controllers/driver/account');
const staticContentController = require('../controllers/driver/staticContent');
// on boarding API's
router.post('/login',joiValidation.validateBody(apiSchema.login), onBoardingController.login);
router.post('/forgot_password',joiValidation.validateBody(apiSchema.forgot_password), onBoardingController.forgot_password);
router.post('/verify_otp',joiValidation.validateBody(apiSchema.verify_otp), onBoardingController.verify_otp);
router.post('/changePassword', driverAuthentication.validateDriverToken,  joiValidation.validateBody(apiSchema.changePassword), onBoardingController.changeDriverPassword);
router.post('/sign_up_step1',  joiValidation.validateBody(apiSchema.sign_up_step1), onBoardingController.sign_up_step1);
router.post('/sign_up_details_step1', driverAuthentication.validateDriverToken, joiValidation.validateBody(apiSchema.sign_up_details_step1), onBoardingController.sign_up_details_step1);
router.post('/sign_up_details_step2', driverAuthentication.validateDriverToken, joiValidation.validateBody(apiSchema.sign_up_details_step2), onBoardingController.sign_up_details_step2);
router.post('/sign_up_details_step3', driverAuthentication.validateDriverToken, joiValidation.validateBody(apiSchema.sign_up_details_step3), onBoardingController.sign_up_details_step3);
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

module.exports = router;