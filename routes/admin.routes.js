const express = require('express');
const router=express.Router();
const { check, body, query, param, oneOf, validationResult } = require('express-validator');

const adminLoginController = require('../controllers/admin/login');

router.route('/login').post([
    check('email', 'Please enter valid email id').not().isEmpty().isEmail().normalizeEmail(),
    check('password', 'Please enter password').not().isEmpty()
], adminLoginController.login);

module.exports = router;