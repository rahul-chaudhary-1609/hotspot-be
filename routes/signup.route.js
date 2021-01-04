const express=require('express');
const schema=require("./validation");
const passwordHash = require('password-hash');
const { Op } = require("sequelize");
const passport = require('passport');
require('./passport-setup');

const { Customer}=require("../models")


const router=express.Router();


const signupCustomer=async (data)=>{

    const result=schema.validate(data);

    if(result.error){
        return result.error.details[0].message;
    }

    if(result.value){

        const {name, email,phone,password}=result.value;

        console.log("result error:",result.error,result.value);
    
        const hashedPassword=passwordHash.generate(password);
    
    
        try {
            const [constomer,created]=await Customer.findOrCreate({
                where:{
                    [Op.or]:{
                        email:email,
                        phone:phone,
                    }
                },
                defaults:{
                    name:name,
                    email:email,
                    phone:phone,
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
                        phone:phone,
                    }
                });
    
                if(checkEmail!==null){
                    return `Customer with the same email is already exist. \n Login with ${email}`;
                }
    
                if(checkPhone!==null){
                    return "Customer with the same phone is already exist.";
                }
                
            }
            
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);        
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
    const body={name:req.user.displayName,email:req.user.emails[0].value}
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



router.get('/logout', (req, res) => {
    req.session = null;
    req.logout();
    res.redirect('/');
})

module.exports=router;