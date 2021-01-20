// require('dotenv/config')
// const express=require('express')



// const router=require('./customer')

// router.get('/',(req,res)=>{
//     res.json("Welcome to Hotspot")
// })

// module.exports=router;

const express = require('express');
const router = express.Router();

router.use("/admin", require("./admin.routes"));
router.use("/customer", require("./customer"));

module.exports = router;