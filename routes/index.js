require('dotenv/config')
const express=require('express')



const router=require('./customer')

router.get('/',(req,res)=>{
    res.send("Welcome to Hotspot")
})

module.exports=router;