require('dotenv/config');
require('../middlewares/customer/passport-setup');
const express = require('express');
const passport = require('passport');
const sendMail = require('../utilityServices/mail');
const { signupCustomer, generateOTP, validateOTP}=require('../controllers/customer/login')

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
    const body = { id: req.user.id, name: req.user.displayName, email: req.user.emails[0].value };
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
    const body = { id: req.user.id, name: req.user.displayName, email: req.user.emails[0].value };
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



router.get('/generateOTP', async(req, res) => {
    // //console.log(req.query);
    // try {
    //     const response = generateOTP(req.query);
    //     console.log(response);
    //     res.send(response);
    // } catch (error) {
    //     console.log(error);
    //     return res.status(500).json(error);
    // }

    generateOTP(req.query)
        .then((data) => {
            res.status(200).send({ message: `Verification code is sent to +${req.query.country_code}${req.query.phone}` });
        })
        .catch((error) => {
            res.status(500).send(error);
        })
});

router.get('/validateOTP', async (req, res) => {
    //console.log(req.query);
    // try {
    //     const response = validateOTP(req.query);
    //     console.log(response);
    //     res.send(response);
    // } catch (error) {
    //     console.log(error);
    //     return res.status(500).json(error);
    // }

    validateOTP(req.query)
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


router.post('/verifyEmail', async (req, res) => {
    var mailOptions = {
        from: `Hotspot 👻 <${process.env.ev_email}>`,
        to: req.body.email,
        subject: 'Email Verification',
        text: 'Here is your code'
    };
    sendMail(mailOptions).then((resp) => {
        res.send(resp);
    });
    //console.log(response)
    
})

module.exports=router;