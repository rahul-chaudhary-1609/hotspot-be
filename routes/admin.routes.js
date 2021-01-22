const express = require('express');
const router=express.Router();
const { check, body, query, param, oneOf, validationResult } = require('express-validator');

const adminLoginController = require('../controllers/admin/login');
const adminMiddleware = require('../middlewares/adminMiddleware');

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

router.route('/logout').post([adminMiddleware.checkToken
], adminLoginController.logout);

module.exports = router;