require('dotenv/config')
const express = require('express');
const schema=require("../middlewares/validation");
const passwordHash = require('password-hash');
const { Op } = require("sequelize");
const passport = require('passport');
const sendMail = require('../utilityServices/mail');

const client = require('twilio')(process.env.accountSID, process.env.authToken);

require('../middlewares/passport-setup');

const { Customer}=require("../models");
const { message } = require('../middlewares/validation');


const router=express.Router();


const signupCustomer=async (data)=>{

    const result=schema.validate(data);

    if(result.error){
        return result.error.details[0].message;
    }

    if(result.value){

        const { name, email, country_code, phone, password } = result.value;
        


        console.log("result error:",result.error,result.value);
    
        const hashedPassword=passwordHash.generate(password);
    

        const [constomer,created]=await Customer.findOrCreate({
            where:{
                [Op.or]:{
                    email:email,
                    phone_no:parseInt(phone),
                }
            },
            defaults:{
                name:name,
                email: email,
                country_code:country_code,
                phone_no:parseInt(phone),
                password:hashedPassword,
            }
        });
        
        if(created){
            return constomer;
        }
        else{
            const checkEmail=await Customer.findOne({
                where:{
                    email:email,
                }
            });
            const checkPhone=await Customer.findOne({
                where:{
                    phone_no: parseInt(phone),
                }
            });

            if(checkEmail!==null){
                return `Customer with the same email is already exist. \n Login with ${email}`;
            }

            if(checkPhone!==null){
                return "Customer with the same phone is already exist.";
            }
            
        }
        
        
    }
    

}                                     

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


router.get('/failed', (req, res) =>{
    
    res.json("Login Failed")
})


// Social Media Logout
router.get('/logout', (req, res) => {
    req.session = null;
    req.logout();
    res.redirect('/');
})

// Route for customer signup with facebook account
router.get('/customer-facebook-signup', passport.authenticate('facebook', { scope: 'email' }));

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

router.get('/generateOTP', (req, res) => {
    console.log(req.query);
    client
        .verify
        .services(process.env.serviceID)
        .verifications
        .create({
            to: `+${req.query.country_code}${req.query.phone}`,
            channel: req.query.channel
        })
        .then((data) => {
            res.status(200).json({ message: `Verification code is sent to +${req.query.country_code}${req.query.phone}` });
        })
        .catch((error) => {
            res.status(500).json(error);
        })
});

router.get('/validateOTP', (req, res) => {
    console.log(req.query);
    client
        .verify
        .services(process.env.serviceID)
        .verificationChecks
        .create({
            to: `+${req.query.country_code}${req.query.phone}`,
            code: req.query.code
        })
        .then((data) => {
            if (data.status === "approved")
            {
                res.status(200).json({ message: `Phone verified`})
            }
            else {
                res.status(200).json({ message: `Invalid Code`})
            }
        })
        .catch((error) => {
            res.status(500).json(error);
    })
})


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