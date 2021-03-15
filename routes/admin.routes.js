const express = require('express');
const router=express.Router();
const { check, body, query, param, oneOf, validationResult } = require('express-validator');

const adminLoginController = require('../controllers/admin/login');
const adminRestaurantController = require('../controllers/admin/restaurant');
const adminCustomerController = require('../controllers/admin/customer');
const adminDashboardController = require('../controllers/admin/dashboard');
const adminDriverController = require('../controllers/admin/driver');
const adminOrderController = require('../controllers/admin/order');
const adminAuthentication = require('../middlewares/admin/jwt');
const adminMulter = require('../middlewares/admin/multer');
const adminOthersController = require('../controllers/admin/others');

router.route('/login').post([
    check('email', 'Please enter valid email id').not().isEmpty().isEmail().normalizeEmail(),
    check('password', 'Please enter password').not().isEmpty()
], adminLoginController.login);

router.route('/addNewAdmin').post([
    check('email', 'Please enter valid email id').not().isEmpty().isEmail().normalizeEmail(),
    check('password', 'Please enter password').not().isEmpty(),
    check('confirmPassword', 'Please enter password').not().isEmpty()
], adminLoginController.addNewAdmin);

router.route('/forgotPassword').post([
    check('email', 'Please enter valid email id').not().isEmpty().isEmail().normalizeEmail(),
], adminLoginController.forgotPassword);

router.route('/resetPassword').post([
    check('email', 'Please enter valid email id').not().isEmpty().isEmail().normalizeEmail(),
    check('password', 'Please enter password').not().isEmpty(),
    check('confirmPassword', 'Please enter password').not().isEmpty()
], adminLoginController.resetPassword);

router.route('/logout').get([adminAuthentication.checkToken
], adminLoginController.logout);


//Restaurant Management

router.route('/restaurantCategoryList').get([adminAuthentication.checkToken
], adminRestaurantController.restaurantCategoryList);

router.route('/addRestaurant').post([adminAuthentication.checkToken
], adminRestaurantController.addRestaurant);

router.route('/listRestaurant').get([adminAuthentication.checkToken
], adminRestaurantController.listRestaurant);

router.route('/changeRestaurantStatus/:restaurantId').put([adminAuthentication.checkToken
], adminRestaurantController.changeRestaurantStatus);

router.route('/getRestaurant/:restaurantId').get([adminAuthentication.checkToken
], adminRestaurantController.getRestaurant);

router.route('/editRestaurant/:restaurantId').put([adminAuthentication.checkToken
], adminRestaurantController.editRestaurant);

router.route('/deleteRestaurant/:restaurantId').delete([adminAuthentication.checkToken
], adminRestaurantController.deleteRestaurant);

router.route('/uploadRestaurantImage').put([adminAuthentication.checkToken,adminMulter.upload
], adminRestaurantController.uploadRestaurantImage);


//Menu Management

router.route('/dishCategoryList').get([adminAuthentication.checkToken
], adminRestaurantController.dishCategoryList);

router.route('/addDish').post([adminAuthentication.checkToken
], adminRestaurantController.addDish);

router.route('/getDish/:dishId').get([adminAuthentication.checkToken
], adminRestaurantController.getDish);

router.route('/listDishes').get([adminAuthentication.checkToken
], adminRestaurantController.listDishes);

router.route('/editDish/:dishId').put([adminAuthentication.checkToken
], adminRestaurantController.editDish);

router.route('/deleteDish/:dishId').delete([adminAuthentication.checkToken
], adminRestaurantController.deleteDish);

router.route('/uploadDishImage').put([adminAuthentication.checkToken, adminMulter.upload
], adminRestaurantController.uploadDishImage);




//Customer Management

router.route('/listCustomers').get([adminAuthentication.checkToken
], adminCustomerController.listCustomers);

router.route('/viewCustomerProfile/:customerId').get([adminAuthentication.checkToken
], adminCustomerController.viewCustomerProfile);

router.route('/changeCustomerStatus/:customerId').put([adminAuthentication.checkToken
], adminCustomerController.changeCustomerStatus);

router.route('/editCustomer/:customerId').put([adminAuthentication.checkToken
], adminCustomerController.editCustomer);

router.route('/uploadCustomerImage').put([adminAuthentication.checkToken, adminMulter.upload
], adminCustomerController.uploadCustomerImage);

router.route('/deleteCustomer/:customerId').delete([adminAuthentication.checkToken
], adminCustomerController.deleteCustomer);



//Dashboard Management

router.route('/getTotalCustomers').get([adminAuthentication.checkToken
], adminDashboardController.getTotalCustomers);

router.route('/getTotalRestaurants').get([adminAuthentication.checkToken
], adminDashboardController.getTotalRestaurants);

router.route('/getTotalDrivers').get([adminAuthentication.checkToken
], adminDashboardController.getTotalDrivers);

router.route('/getTotalOrders').get([adminAuthentication.checkToken
], adminDashboardController.getTotalOrders);

router.route('/getTotalRevenue').get([adminAuthentication.checkToken
], adminDashboardController.getTotalRevenue);

router.route('/getTotalRevenueByDate').get([adminAuthentication.checkToken
], adminDashboardController.getTotalRevenueByDate);


//Driver Management

router.route('/listDrivers').get([adminAuthentication.checkToken
], adminDriverController.listDrivers);

router.route('/getDriverDetails/:driverId').get([adminAuthentication.checkToken
], adminDriverController.getDriverDetails);

router.route('/approveDriver/:driverId').put([adminAuthentication.checkToken
], adminDriverController.approveDriver);

router.route('/changeDriverStatus/:driverId').put([adminAuthentication.checkToken
], adminDriverController.changeDriverStatus);

router.route('/uploadDriverProfileImage').put([adminAuthentication.checkToken, adminMulter.upload
], adminDriverController.uploadDriverProfileImage);

router.route('/uploadVehicleImage').put([adminAuthentication.checkToken, adminMulter.upload
], adminDriverController.uploadVehicleImage);

router.route('/uploadLicenseImage').put([adminAuthentication.checkToken, adminMulter.upload
], adminDriverController.uploadLicenseImage);

router.route('/uploadInsuranceImage').put([adminAuthentication.checkToken, adminMulter.upload
], adminDriverController.uploadInsuranceImage);

router.route('/editDriver/:driverId').put([adminAuthentication.checkToken
], adminDriverController.editDriver);

router.route('/addDrivers').get(adminDriverController.addDrivers);


//order Management

router.route('/getActiveOrders').get([adminAuthentication.checkToken
], adminOrderController.getActiveOrders);

router.route('/getScheduledOrders').get([adminAuthentication.checkToken
], adminOrderController.getScheduledOrders);



//others

router.route('/drop').get([], adminOthersController.drop);

module.exports = router;