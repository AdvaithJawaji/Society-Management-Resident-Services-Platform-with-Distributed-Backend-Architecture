const express = require('express');
const router = express.Router();
const { registerVisitor, updateVisitorStatus, getVisitors } = require('../controllers/visitorController');

router.post('/register', registerVisitor);
router.patch('/:id/status', updateVisitorStatus);
router.get('/', getVisitors);

module.exports = router;
