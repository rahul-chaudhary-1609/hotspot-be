const express = require('express');

const joiValidation = require("../middlewares/joi");
const apiSchema = require("../apiSchema/driverSchema");

const customerAuthentication = require('../middlewares/jwt');
const router=express.Router();
const multer = require('../middlewares/multer');

const { OnBoardingController }   = require('../controllers/driver/onBoardingController');

const onBoardingController = new OnBoardingController(); 

// on boarding API's
router.post('/login',joiValidation.validateBody(apiSchema.login), onBoardingController.login);
router.post('/forgot_password',joiValidation.validateBody(apiSchema.forgot_password), onBoardingController.forgot_password);


module.exports = router;