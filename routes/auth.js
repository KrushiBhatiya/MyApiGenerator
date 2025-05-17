
var express = require('express');
var router = express.Router();

var TC = require('../middleware/tokenCheck')
var AC = require('../controller/apiController')

router.post('/signUp' , AC.authCreateData)
router.post('/login' , AC.authDataCheck)

module.exports = router;