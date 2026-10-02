const express = require('express');
const router = express.Router();
const { getFinancialStats, getComplaintInsights, getEvents, getProviders, getFeedback } = require('../controllers/analyticsController');

router.get('/finance', getFinancialStats);
router.get('/insights', getComplaintInsights);
router.get('/events', getEvents);
router.get('/providers', getProviders);
router.get('/feedback', getFeedback);

module.exports = router;
