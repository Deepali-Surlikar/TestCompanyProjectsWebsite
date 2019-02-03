'use strict';
var express = require('express');
var router = express.Router();

var companyProjectsApi = require('../api/companyProjectsApi');

//http://localhost:3000/api/company/getallprojects
router.get('/getallprojects', companyProjectsApi.getAllProjects);

//http://localhost:3000/api/company/saveprojectsdetails
router.post('/saveprojectsdetails', companyProjectsApi.saveProjectDetails);

module.exports = router;