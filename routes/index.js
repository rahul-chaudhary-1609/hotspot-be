require('dotenv/config')
const express=require('express')


const router=express.Router();

router.get('/',(req,res)=>{
    res.send("Welcome to Hotspot")
})

module.exports=router;