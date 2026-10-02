const express = require('express');
const router = express.Router();
const { generateBills, getBills, processPayment } = require('../controllers/billingController');

router.get('/', getBills);
router.post('/generate', generateBills);
router.post('/pay', processPayment);

module.exports = router;
