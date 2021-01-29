require('dotenv/config');
const { Customer } = require('../models');
const { Op } = require("sequelize");
const express = require('express');
const passport = require('passport');
const { phoneSchema } = require('../middlewares/customer/validation');
const customerAuthentication = require('../middlewares/customer/jwt-validation');
const customerLoginController = require('../controllers/customer/login');
const HotspotLocationController = require('../controllers/customer/hotspot_location');
const customerMulter = require('../middlewares/customer/multer');

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


router.get('/verify-phone', (req, res) => {
    return customerLoginController.generatePhoneOTP(req,res)            
});

router.get('/validate-phone', async (req, res) => {
    return customerLoginController.validatePhoneOTP(req, res);
});


router.get('/verify-email', (req, res) => {     
    return customerLoginController.generateEmailOTP(req, res);    
});

router.get('/validate-email', async (req, res) => {
    return customerLoginController.validateEmailOTP(req, res);  
});

router.get('/send-password-reset-code', async(req, res) => {
    return customerLoginController.generatePassResetCode(req, res)   
})

router.get('/validate-password-reset-code', async (req, res) => {
    return customerLoginController.validatePassResetCode(req, res);        
});

router.put('/reset-password', (req, res) => {
    return customerLoginController.resetPassword(req,res);
});

router.get('/customer-profile', customerAuthentication.authenticateCustomer, (req, res) => {
    return customerLoginController.getCustomerProfile(req, res);
});

router.put('/customer-update-profile', customerAuthentication.authenticateCustomer, (req, res) => {
    return customerLoginController.updateCustomerProfile(req, res);
});

router.post('/customer-add-address', customerAuthentication.authenticateCustomer, (req, res) => {
    return customerLoginController.addCustomerAddress(req, res);
});

router.get('/customer-get-address', customerAuthentication.authenticateCustomer, (req, res) => {
    return customerLoginController.getCustomerAddress(req, res);
});

router.put('/customer-set-default-address', customerAuthentication.authenticateCustomer, (req, res) => {
    return customerLoginController.setCustomerDefaultAddress(req, res);
});
 
router.put('/customer-change-password', customerAuthentication.authenticateCustomer, (req, res) => {
    return customerLoginController.changeCustomerPassword(req, res);
});

router.put('/customer-change-profile-picture', customerAuthentication.authenticateCustomer, customerMulter.upload, (req, res) => {
    return customerLoginController.changeCustomerPicture(req, res);
});

router.post('/customer-feedback', customerAuthentication.authenticateCustomer, (req, res) => {
    return customerLoginController.feedbackCustomer(req, res);
});

router.put('/customer-toggle-notification', customerAuthentication.authenticateCustomer, (req, res) => {
    return customerLoginController.toggleNotification(req, res);
});

router.get('/get-notification-status', customerAuthentication.authenticateCustomer, (req, res) => {
    return customerLoginController.getNotificationStatus(req, res);
});

router.delete('/customer-logout', (req, res) => {
    return customerLoginController.logoutCustomer(req, res);
});



//Hotspot Locations Routes


router.get('/get-hotspot-location', customerAuthentication.authenticateCustomer, (req, res) => {
    return HotspotLocationController.getHotspotLocation(req, res);
});

// router.get('/get-hotspot-addresses', customerAuthentication.authenticateCustomer, (req, res) => {
//     return HotspotLocationController.getHotspotAddresses(req, res);
// });


module.exports=router;
