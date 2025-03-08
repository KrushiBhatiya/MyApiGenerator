var express = require('express');
var router = express.Router();
const multer = require('multer');
const storage = multer.diskStorage({}); // Store files in memory temporarily
const upload = multer({ storage });

var TC = require('../middleware/tokenCheck')
var AC = require('../controller/apiController')

// var st = "hello"
router.post('/:name' , upload.any() , TC.checkToken , AC.createData)
router.post('/:name/:id', upload.any() , TC.checkToken , AC.editData)
router.get('/:name' , TC.checkToken , AC.viewData)
router.delete('/:name/:id' , TC.checkToken , AC.deleteData)
router.patch('/:name/:id', upload.any() , TC.checkToken , AC.editData)

module.exports = router;
