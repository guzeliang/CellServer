var express = require('express');
var router = express.Router();
var apiCtrl = require('../controllers/iot');

router.get('/api/iot/page', apiCtrl.getPage);
router.get('/api/iot/detail', apiCtrl.getDetail);
router.get('/api/iot/stat', apiCtrl.stat);

module.exports = router;