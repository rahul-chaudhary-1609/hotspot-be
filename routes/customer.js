require('dotenv/config');
require('../middlewares/customer/passport-setup');
const express = require('express');
const passport = require('passport');

const { signupCustomer, generatePhoneOTP, validatePhoneOTP, generateEmailOTP,validateEmailOTP}=require('../controllers/customer/login')

const router=express.Router();
                                

// Route for customer signup with email and phone
router.post('/customer-email-signup', async (req,res)=>{

    try {  
        const response=await signupCustomer(req.body); 
        res.send(response);
    } catch (error) {
        console.log(error);
        return res.status(500).json(error); 
    }
     
});



// Route for customer signup with google account
router.get('/customer-google-signup', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback Route for customer signup with google account
router.get('/customer-google-signup-cb', passport.authenticate('google', { failureRedirect: '/failed'}),async (req,res)=>{
    const body = {
        google_id: req.user.id, name: req.user.displayName, email: req.user.emails[0].value, country_code: '+91',
        phone: '9555269398',
        password: '123456' };
    console.log(body);
    try {
        const response=await signupCustomer(body); 
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
        const response = await signupCustomer(body);
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



router.get('/verifyPhone', async(req, res) => {

    generatePhoneOTP(req.query)
        .then((data) => {
            res.status(200).send({ message: `Verification code is sent to +${req.query.country_code}${req.query.phone}` });
        })
        .catch((error) => {
            res.status(500).send(error);
        })
});

router.get('/validatePhone', async (req, res) => {

    validatePhoneOTP(req.query)
        .then((data) => {
            if (data.status === "approved") {
                res.status(200).send({ message: `Phone verified` });
            }
            else {
                res.status(401).send({ message: `Invalid Code` });
            }
        }).catch((error) => {
            res.status(500).send(error);
        })

});


router.get('/verifyEmail', async (req, res) => {
    generateEmailOTP(req.query)
        .then((resp) => {
            res.send(`Verification Email Sent to : ${req.query.email}`);
        }).catch((error) => {
            res.status(500).send(error);
        });
    
});

router.get('/validateEmail', async (req, res) => {
    console.log(req.query);
    try {
        if (validateEmailOTP(req.query)) {
            res.send(`${req.query.email} is verified.`);
        }
    } catch (error) {
        res.status(500).send(error);
    }
   
});

module.exports=router;