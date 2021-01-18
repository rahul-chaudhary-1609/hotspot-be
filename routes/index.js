require('dotenv/config')
const express=require('express')



const router=require('./customer')

router.get('/',(req,res)=>{
    res.json("Welcome to Hotspot")
})

module.exports=router;