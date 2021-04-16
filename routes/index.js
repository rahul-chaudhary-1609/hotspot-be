const express = require('express');
// const router = express.Router();
const handler = require("../utils/handler");

// //admin routes
// router.use("/admin", require("./admin.routes"));

// //customer routes
// router.use("/customer", require("./customer.routes"));

// //driver routes
// router.use("/driver", require("./driver.routes"));

// router.use((err, req, res) => {
//     console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
//     err.method_name = req.url
//     handler.handleError(err, res);
// });

// //temporary
// //router.use("/", require("./customer.routes")); 

// module.exports = router;

module.exports = function(router) {
    router.use("/admin", require("./admin.routes"));
    router.use("/customer", require("./customer.routes"));
    router.use(`/driver`, require("./driver.routes"));
    router.use((err, req, res, next) => {
        err.method_name = req.url
        handler.handleError(err, res);
    });
  }