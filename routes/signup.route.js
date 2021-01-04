const express=require('express');
const schema=require("./validation");
const passwordHash = require('password-hash');
const { Op } = require("sequelize");

const { Customer}=require("../models")


const router=express.Router();

router.post('/customer-signup', async (req,res)=>{

    const result=schema.validate(req.body);

    if(result.error){
        return res.send(result.error.details[0].message);
    }
    
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
            return res.json(constomer);
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
                return res.json(`Customer with the same email is already exist. \n Login with ${email}`);
            }

            if(checkPhone!==null){
                return res.json("Customer with the same phone is already exist.");
            }
            
        }
        
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);        
    }

    
     
})

module.exports=router;