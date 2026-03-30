const express = require('express');
const statsController = require('../controllers/statsController');

const router = express.Router();

router.get('/summary', statsController.getSummaryStats);

module.exports = router;
