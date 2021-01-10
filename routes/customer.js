require('dotenv/config');
require('../middlewares/customer/passport-setup');
const { Customer } = require('../models');
const express = require('express');
const passport = require('passport');
const { phoneSchema } = require('../middlewares/customer/validation');

const { signupCustomer,loginCustomer,loginWithGoogle,loginWithFacebook, generatePhoneOTP, validatePhoneOTP, generateEmailOTP,validateEmailOTP}=require('../controllers/customer/login')

const router=express.Router();

// Route for customer login with email and phone
router.post('/customer-email-login', async (req, res) => {

    try {
        const response = await loginCustomer(req.body);
        res.status(200).send(response);
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }

});

// Route for customer signup with email and phone
router.post('/customer-email-signup', async (req,res)=>{

    try {  
        const response=await signupCustomer(req.body); 
        res.status(200).send(response);
    } catch (error) {
        console.log(error);
        return res.status(500).json(error); 
    }
     
});



// Route for customer signup with google account
router.get('/customer-google-signup', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback Route for customer signup with google account
router.get('/customer-google-signup-cb', passport.authenticate('google', { failureRedirect: '/failed'}),async (req,res)=>{
    const body = {google_id: req.user.id, name: req.user.displayName, email: req.user.emails[0].value};
    console.log(body);
    try {
        const response=await loginWithGoogle(body); 
        res.send(response);
    } catch (error) {
        console.log(error);
        return res.status(500).json(error); 
    }
});

// Route for customer signup with facebook account
router.get('/customer-facebook-signup', passport.authenticate('facebook', { scope: 'email' }));

// Callback Route for customer signup with facebook account
router.get('/customer-facebook-signup-cb', passport.authenticate('facebook', { failureRedirect: '/failed' }), async (req, res) => {
    const body = { facebook_id: req.user.id, name: req.user.displayName, email: req.user.emails[0].value };
    console.log(body);
    try {
        const response = await loginWithFacebook(body);
        res.send(response);
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
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



router.get('/verify-phone', async (req, res) => {

    const data = {
        phone: req.query.phone,
        country_code: req.query.country_code
    }
    
    const result = customerSchema.validate(data);

    if (result.error) {
        return res.status(400).send({ message: result.error.details[0].message });
    }

    if (result.value) {

        return generatePhoneOTP(req.query)
                .then((resp) => {
                    res.status(200).send({ message: `Verification code is sent to +${req.query.country_code}${req.query.phone}` });
                })
                .catch((error) => {
                    res.status(500).send(error);
                })
    }
});

router.get('/validate-phone', async (req, res) => {

    const data = {
        phone: req.query.phone,
        country_code: req.query.country_code
    }

    const result = customerSchema.validate(data);

    if (result.error) {
        return res.status(400).send({ message: result.error.details[0].message });
    }

    if (result.value) {

        return validatePhoneOTP(req.query)
                .then((resp) => {
                    if (resp.status === "approved") {
                        res.status(200).send({ message: `Phone verified` });
                    }
                    else {
                        res.status(401).send({ message: `Invalid Code` });
                    }
                }).catch((error) => {
                    res.status(500).send(error);
                })
    }

});


router.get('/verify-email', async (req, res) => {
    
    try {
        
        if (!req.query.email){
            return res.send(`Please provide email id to verify`);
        }

        let customer = await Customer.findOne({
            where: {
                email: (req.query.email).toLowerCase(),
            }
        });

        if (!customer) {
            return res.send(`User does not exist with provided email: ${req.query.email}`);
        }

        if (customer.getDataValue('is_email_verified')) {
            return res.send(`${req.query.email} is already verified`);
        }
        else {

           return generateEmailOTP(req.query)
                .then((resp) => {
                    res.send(`Verification Email Sent to : ${req.query.email}`);
                }).catch((error) => {
                    res.status(500).send(error);
                });
        }
    } catch (error) {
       return res.status(500).send(error);
    }
    
    
});

router.get('/validate-email', async (req, res) => {
    
    try {
        if (!req.query.email) {
            return res.send(`Please provide email id and code to validate user`);
        }

        let customer = await Customer.findOne({
            where: {
                email: req.query.email,
            }
        });

        if (!customer) {
            return res.send(`User does not exist with this email: ${req.query.email}`);
        }

        if (customer.getDataValue('is_email_verified')) {
            return res.send(`${req.query.email} is already verified`);
        }
        else {

            if (validateEmailOTP(req.query)) {
                return res.send(`${req.query.email} is verified.`);
            }
            else {
               return res.status(400).send('Some Error Occured in Email Verification');
            }
        }
       
    } catch (error) {
        return res.status(500).send(error);
    }
   
});

module.exports=router;
