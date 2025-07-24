
var express = require('express');
var router = express.Router();

var TC = require('../middleware/tokenCheck')
var AC = require('../controller/apiController')

router.post('/signUp' , TC.checkToken , AC.authCreateData)
router.post('/login' , TC.checkToken  , AC.authDataCheck)
router.get('/authUser' , TC.checkToken , AC.authData)

module.exports = router;