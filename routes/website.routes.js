const express = require('express');

const joiValidation = require("../middlewares/joi");
const apiSchema = require("../apiSchema/websiteSchema");

const driverAuthentication = require('../middlewares/jwt');
const router=express.Router();
const multer = require('../middlewares/multer');

const staticContentController = require('../controllers/website/staticContent');

router.get('/getFaqTopics', staticContentController.getFaqTopics);
router.get('/getFaqDetails',joiValidation.validateQueryParams(apiSchema.getFaqDetails), staticContentController.getFaqDetails);
router.get('/getStaticContent/:id', staticContentController.getStaticContent);

module.exports = router;
