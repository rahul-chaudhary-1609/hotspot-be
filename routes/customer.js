require('dotenv/config');
require('../middlewares/customer/passport-setup');
const { Customer } = require('../models');
const { Op } = require("sequelize");
const express = require('express');
const passport = require('passport');
const { phoneSchema } = require('../middlewares/customer/validation');
const { authenticateCustomer } = require('../middlewares/customer/jwt-validation');
const { addCustomerAddress, feedbackCustomer, getCustomerAddress,logoutCustomer,updateCustomerProfile,changeCustomerPassword,getCustomerProfile, resetPassword,validatePassResetCode, generatePassResetCode,signupCustomer, loginWithEmail, loginWithPhone, loginWithGoogle, loginWithFacebook, generatePhoneOTP, validatePhoneOTP, generateEmailOTP, validateEmailOTP } = require('../controllers/customer/login');
//require('../controllers/customer/login');

const router=express.Router();

// Route for customer login with email
router.post('/customer-email-login', async (req, res) => {

    try {
        const response = await loginWithEmail(req.body);
        res.status(response.status).json(response);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }

});

// Route for customer login with phone
router.post('/customer-phone-login', async (req, res) => {

    try {
        const response = await loginWithPhone(req.body);
        res.status(response.status).json(response);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }

});

// Route for customer login with google
router.post('/customer-google-login', async (req, res) => {
    const body = { google_id: req.body.id, name: req.body.name, email: req.body.email };
    console.log(body);
    try {
        const response = await loginWithGoogle(body);
        res.status(response.status).json(response);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }

});

// Route for customer login with facebook
router.post('/customer-facebook-login', async (req, res) => {

    const body = { facebook_id: req.body.id, name: req.body.name, email: req.body.email };
    console.log(body);
    try {
        const response = await loginWithFacebook(body);
        res.status(response.status).json(response);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }

});

// Route for customer signup with email and phone
router.post('/customer-email-signup', async (req,res)=>{

    try {  
        const response=await signupCustomer(req.body); 
        res.status(response.status).json(response);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500); 
    }
     
});


// Route for customer signup with google
router.post('/customer-google-signup', async (req, res) => {
    const body = { google_id: req.body.id, name: req.body.name, email: req.body.email };
    console.log(body);
    try {
        const response = await loginWithGoogle(body);
        res.status(response.status).json(response);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
});

// Route for customer signup with facebook
router.post('/customer-facebook-signup', async (req, res) => {
    const body = { facebook_id: req.body.id, name: req.body.name, email: req.body.email };
    console.log(body);
    try {
        const response = await loginWithFacebook(body);
        res.status(response.status).json(response);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
});



// Route for customer authentication with google account
router.get('/customer-google-auth', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback Route for customer authentication with google account
router.get('/customer-google-auth-cb', passport.authenticate('google', { failureRedirect: '/failed'}),async (req,res)=>{
    const body = {google_id: req.user.id, name: req.user.displayName, email: req.user.emails[0].value};
    console.log(body);
    try {
        const response=await loginWithGoogle(body); 
        res.status(response.status).json(response);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500); 
    }
});

// Route for customer authentication with facebook account
router.get('/customer-facebook-auth', passport.authenticate('facebook', { scope: 'email' }));

// Callback Route for customer authentication with facebook account
router.get('/customer-facebook-auth-cb', passport.authenticate('facebook', { failureRedirect: '/failed' }), async (req, res) => {
    const body = { facebook_id: req.user.id, name: req.user.displayName, email: req.user.emails[0].value };
    console.log(body);
    try {
        const response = await loginWithFacebook(body);
        res.status(response.status).json(response);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
});


// route on signup failure
router.get('/failed', (req, res) =>{    
    res.json("Signup Failed")
})


// route for Logout
router.get('/logout', (req, res) => {
    req.session = null;
    req.logout();
    res.redirect('/');
})



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
    try {

        if (!req.query.emailOrPhone) {
            return res.status(400).json({ status: 400, message: `Please provide email/phone to reset password` });
        }

        const phone_no = parseInt(req.query.emailOrPhone);
        const email = (req.query.emailOrPhone).toLowerCase();

        let customer = null;

        if (isNaN(phone_no)) {
            customer = await Customer.findOne({
                where: {
                        email
                }
            });            
        }
        else {
            customer = await Customer.findOne({
                where: {
                    [Op.or]: {
                        email, phone_no,
                    }
                }
            });
        }
        

        if (!customer) {
            return res.status(404).json({ status: 404, message: `User does not exist with provided email/phone` });
        }

        if (!customer.getDataValue('is_email_verified')) {
            return res.status(409).json({ status: 409, message: `${req.query.emailOrPhone} is not verified` });
        }
        
        
        req.query.email = customer.getDataValue('email');

        return generatePassResetCode(req.query)
            .then((resp) => {
                res.status(200).json({ status: 200, message: `Password reset code Sent to : ${req.query.email}` });
            }).catch((error) => {
                res.sendStatus(500);
            });
        
    } catch (error) {
        return res.sendStatus(500);
    }
})

router.get('/validate-password-reset-code', async (req, res) => {

    try {
        if (!req.query.emailOrPhone) {
            return res.status(400).json({ status: 400, message: `Please provide email/phone to reset password` });
        }

        const phone_no = parseInt(req.query.emailOrPhone);
        const email = (req.query.emailOrPhone).toLowerCase();

        let customer = null;

        if (isNaN(phone_no)) {
            customer = await Customer.findOne({
                where: {
                    email
                }
            });
        }
        else {
            customer = await Customer.findOne({
                where: {
                    [Op.or]: {
                        email, phone_no,
                    }
                }
            });
        }


        if (!customer) {
            return res.status(404).json({ status: 404, message: `User does not exist with provided email/phone` });
        }

        if (!customer.getDataValue('is_email_verified')) {
            return res.status(409).json({ status: 409, message: `${req.query.emailOrPhone} is not verified` });
        }
        

        req.query.email = customer.getDataValue('email')

        validatePassResetCode(req, res);
        

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }

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
 
router.put('/customer-change-password', authenticateCustomer, (req, res) => {
    return (changeCustomerPassword(req, res));
});

router.post('/customer-feedback', authenticateCustomer, (req, res) => {
    return (feedbackCustomer(req, res));
});

// router.put('/customer-refresh', (req, res) => {
//     return (getAccessToken(req, res));
// });

router.delete('/customer-logout', (req, res) => {
    return (logoutCustomer(req, res));
});


module.exports=router;
