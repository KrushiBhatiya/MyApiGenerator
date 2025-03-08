var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');

var IC = require('../controller/indexController')

router.get('/', IC.indexPage);
router.get('/modelPage', IC.modelPage);
router.get('/projectPage', IC.projectPage);
router.get('/projectCollection', IC.projectCollection);
router.post('/submit', IC.createModel);
router.post('/projectsubmit', IC.createProject);
module.exports = router;
