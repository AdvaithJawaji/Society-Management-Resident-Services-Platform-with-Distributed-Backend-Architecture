const db = require('../config/db');

// Create a single notification (Internal API or Admin)
const createNotification = async (req, res) => {
    const { user_id, type, message } = req.body;

    if (!user_id || !type || !message) {
        return res.status(400).json({ message: 'user_id, type, and message are required' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)',
            [user_id, type, message]
        );
        
        // Emit real-time notification
        if (req.io) {
            req.io.to(`user_${user_id}`).emit('new_notification', {
                id: result.insertId,
                type,
                message,
                created_at: new Date().toISOString()
            });
        }
        
        res.status(201).json({ message: 'Notification created successfully', id: result.insertId });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Broadcast an announcement to all residents (Admin only)
const broadcastAnnouncement = async (req, res) => {
    const role = req.headers['x-user-role'];
    const { title, content } = req.body;
    const authorId = req.headers['x-user-id'];

    if (role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden: Admins only' });
    }

    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Insert into notices table
        const [noticeResult] = await connection.query(
            'INSERT INTO notices (title, content, author_id) VALUES (?, ?, ?)',
            [title, content, authorId]
        );

        // 2. Get all resident user_ids
        const [residents] = await connection.query('SELECT user_id FROM residents');

        // 3. Create a notification for each resident
        if (residents.length > 0) {
            const notificationValues = residents.map(r => [r.user_id, 'NOTICE', `New Notice: ${title}`]);
            await connection.query(
                'INSERT INTO notifications (user_id, type, message) VALUES ?',
                [notificationValues]
            );

            // Emit WS event to all residents
            residents.forEach(r => {
                req.io.to(`user_${r.user_id}`).emit('new_notification', {
                    type: 'NOTICE',
                    message: `New Notice: ${title}`,
                    created_at: new Date()
                });
            });
        }

        await connection.commit();
        res.status(201).json({ message: 'Announcement broadcasted successfully', notice_id: noticeResult.insertId });
    } catch (error) {
        await connection.rollback();
        console.error('Error broadcasting announcement:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    } finally {
        connection.release();
    }
};

// Get notifications for the logged-in user
const getMyNotifications = async (req, res) => {
    const userId = req.headers['x-user-id'];

    try {
        const [notifications] = await db.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Mark a notification as read
const markAsRead = async (req, res) => {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];

    try {
        const [result] = await db.query(
            'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Notification not found or unauthorized' });
        }

        res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const markAllAsRead = async (req, res) => {
    const userId = req.headers['x-user-id'];

    try {
        const [result] = await db.query(
            'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
            [userId]
        );
        res.status(200).json({ message: 'Notifications marked as read', updated: result.affectedRows });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { createNotification, broadcastAnnouncement, getMyNotifications, markAsRead, markAllAsRead };
