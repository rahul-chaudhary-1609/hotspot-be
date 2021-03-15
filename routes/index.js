const express = require('express');
const router = express.Router();

router.get('/',(req,res)=>{
    res.json("Welcome to Hotspot")
})

//admin routes
router.use("/admin", require("./admin.routes"));

//customer routes
router.use("/customer", require("./customer.routes"));

//temporary
//router.use("/", require("./customer.routes")); 

module.exports = router;