require('dotenv/config');
require('../middlewares/customer/passport-setup');
const { Customer } = require('../models');
const { Op } = require("sequelize");
const express = require('express');
const passport = require('passport');
const { phoneSchema } = require('../middlewares/customer/validation');
const { authenticateCustomer } = require('../middlewares/customer/jwt-validation');
const { addCustomerAddress, setCustomerDefaultAddress, feedbackCustomer, getCustomerAddress,logoutCustomer,updateCustomerProfile,changeCustomerPassword,getCustomerProfile, resetPassword,validatePassResetCode, generatePassResetCode,signupCustomer, loginWithEmail, loginWithPhone, loginWithGoogle, loginWithFacebook, generatePhoneOTP, validatePhoneOTP, generateEmailOTP, validateEmailOTP } = require('../controllers/customer/login');
//require('../controllers/customer/login');

const router=express.Router();

// Route for customer login with email
router.post('/customer-email-login', (req, res) => {
    return loginWithEmail(req, res);
});

// Route for customer login with phone
router.post('/customer-phone-login', (req, res) => {
    return loginWithPhone(req, res);
});

// Route for customer login with google
router.post('/customer-google-login', (req, res) => {
    return loginWithGoogle(req,res);
});

// Route for customer login with facebook
router.post('/customer-facebook-login', (req, res) => {
    return loginWithFacebook(req, res);
});

// Route for customer signup with email and phone
router.post('/customer-email-signup', (req, res) => {
    return signupCustomer(req, res);      
});


// Route for customer signup with google
router.post('/customer-google-signup', async (req, res) => {
    return loginWithGoogle(req, res);
});

// Route for customer signup with facebook
router.post('/customer-facebook-signup', async (req, res) => {
    return loginWithFacebook(req, res);
});


router.get('/verify-phone', (req, res) => {
    return generatePhoneOTP(req,res)            
});

router.get('/validate-phone', async (req, res) => {
    return validatePhoneOTP(req, res);
});


router.get('/verify-email', (req, res) => {     
    return generateEmailOTP(req, res);    
});

router.get('/validate-email', async (req, res) => {
    return validateEmailOTP(req, res);  
});

router.get('/send-password-reset-code', async(req, res) => {
    return generatePassResetCode(req, res)   
})

router.get('/validate-password-reset-code', async (req, res) => {
    return validatePassResetCode(req, res);        
});

router.put('/reset-password', (req, res) => {
    return resetPassword(req,res);
});

router.get('/customer-profile', authenticateCustomer, (req, res) => {
    return (getCustomerProfile(req, res));
});

router.put('/customer-update-profile', authenticateCustomer, (req, res) => {
    return (updateCustomerProfile(req, res));
});

router.post('/customer-add-address', authenticateCustomer, (req, res) => {
    return (addCustomerAddress(req, res));
});

router.get('/customer-get-address', authenticateCustomer, (req, res) => {
    return (getCustomerAddress(req, res));
});

router.put('/customer-set-default-address', authenticateCustomer, (req, res) => {
    return (setCustomerDefaultAddress(req, res));
});
 
router.put('/customer-change-password', authenticateCustomer, (req, res) => {
    return (changeCustomerPassword(req, res));
});

router.post('/customer-feedback', authenticateCustomer, (req, res) => {
    return (feedbackCustomer(req, res));
});

router.delete('/customer-logout', (req, res) => {
    return (logoutCustomer(req, res));
});


module.exports=router;
