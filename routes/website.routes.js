const express = require('express');

const joiValidation = require("../middlewares/joi");
const apiSchema = require("../apiSchema/websiteSchema");

const router=express.Router();

const staticContentController = require('../controllers/website/static_content');


router.get('/getStaticContent/:type', joiValidation.validateParams(apiSchema.getStaticContent),staticContentController.getStaticContent);
router.get('/getFaqTopics', staticContentController.getFaqTopics);
router.get('/getFaqs', joiValidation.validateQueryParams(apiSchema.getFaqs), staticContentController.getFaqs);
router.get('/htmlFileUrlToTextConvert', staticContentController.htmlFileUrlToTextConvert);


module.exports = router;
