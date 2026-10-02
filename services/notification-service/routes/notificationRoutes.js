const express = require('express');
const router = express.Router();
const { createNotification, broadcastAnnouncement, getMyNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');

router.post('/broadcast', broadcastAnnouncement);
router.post('/send', createNotification);
router.get('/', getMyNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

module.exports = router;
