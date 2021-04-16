const express = require('express');

const joiValidation = require("../middlewares/joi");
const apiSchema = require("../apiSchema/driverSchema");

const driverAuthentication = require('../middlewares/jwt');
const router=express.Router();
const multer = require('../middlewares/multer');

const { OnBoardingController }   = require('../controllers/driver/onBoardingController');

const onBoardingController = new OnBoardingController(); 

// on boarding API's
router.post('/login',joiValidation.validateBody(apiSchema.login), onBoardingController.login);
router.post('/forgot_password',joiValidation.validateBody(apiSchema.forgot_password), onBoardingController.forgot_password);
router.post('/verify_otp',joiValidation.validateBody(apiSchema.verify_otp), onBoardingController.verify_otp);
router.post('/change_password', driverAuthentication.validateDriverToken,  joiValidation.validateBody(apiSchema.change_password), onBoardingController.change_password);
router.post('/sign_up_step1',  joiValidation.validateBody(apiSchema.sign_up_step1), onBoardingController.sign_up_step1);
router.post('/sign_up_details_step1', driverAuthentication.validateDriverToken, joiValidation.validateBody(apiSchema.sign_up_details_step1), onBoardingController.sign_up_details_step1);
router.post('/sign_up_details_step2', driverAuthentication.validateDriverToken, joiValidation.validateBody(apiSchema.sign_up_details_step2), onBoardingController.sign_up_details_step2);
router.post('/sign_up_details_step3', driverAuthentication.validateDriverToken, joiValidation.validateBody(apiSchema.sign_up_details_step3), onBoardingController.sign_up_details_step3);


module.exports = router;