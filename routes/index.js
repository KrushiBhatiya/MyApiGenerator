var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');

var IC = require('../controller/indexController')
var AC = require('../controller/authController')

router.get('/', IC.indexPage);
router.get('/modelPage', IC.modelPage);
router.get('/projectPage', IC.projectPage);
router.get('/authPage' , AC.authPage)
router.get('/allCollectionPage' , IC.allCollectionPage)
router.get('/projectCollection', IC.projectCollection);
router.get('/check-projectName', IC.checkProjectName);
router.get('/getAllCollection', IC.getAllCollection);
router.get('/check-collection', IC.checkCollection);
router.get('/check-authCollection', IC.checkAuthCollection);
router.post('/submit', IC.createModel);
router.post('/projectsubmit', IC.createProject);
router.post('/authApiGenerate', IC.authApiGenerate);
module.exports = router;
