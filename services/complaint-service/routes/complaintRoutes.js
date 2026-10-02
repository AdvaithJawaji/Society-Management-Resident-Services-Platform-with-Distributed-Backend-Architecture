const express = require('express');
const router = express.Router();
const { createComplaint, updateComplaint, getComplaints } = require('../controllers/complaintController');

router.post('/', createComplaint);
router.patch('/:id', updateComplaint);
router.get('/', getComplaints);

module.exports = router;
