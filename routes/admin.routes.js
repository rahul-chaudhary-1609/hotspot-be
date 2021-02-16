const express = require('express');
const router=express.Router();
const { check, body, query, param, oneOf, validationResult } = require('express-validator');

const adminLoginController = require('../controllers/admin/login');
const adminRestaurantController = require('../controllers/admin/restaurantManagement');
const adminMiddleware = require('../middlewares/adminMiddleware');
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

router.route('/logout').get([adminMiddleware.checkToken
], adminLoginController.logout);

router.route('/restaurantCategoryList').get([adminMiddleware.checkToken
], adminRestaurantController.restaurantCategoryList);

router.route('/addRestaurant').post([adminMiddleware.checkToken
], adminRestaurantController.addRestaurant);

router.route('/listRestaurant').get([adminMiddleware.checkToken
], adminRestaurantController.listRestaurant);

router.route('/changeRestaurantStatus').put([adminMiddleware.checkToken
], adminRestaurantController.changeRestaurantStatus);

router.route('/editRestaurant').put([adminMiddleware.checkToken
], adminRestaurantController.editRestaurant);

router.route('/deleteRestaurant/:restaurantId').delete([adminMiddleware.checkToken
], adminRestaurantController.deleteRestaurant);

router.route('/uploadRestaurantImage').put([adminMiddleware.checkToken,adminMiddleware.upload
], adminRestaurantController.uploadRestaurantImage);

router.route('/dishCategoryList').get([adminMiddleware.checkToken
], adminRestaurantController.dishCategoryList);

router.route('/drop').get([], adminOthersController.drop);

module.exports = router;