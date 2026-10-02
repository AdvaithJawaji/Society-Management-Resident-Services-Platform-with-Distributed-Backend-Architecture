const db = require('../config/db');

const normalizeExpectedTime = (value) => {
    if (!value) return null;
    const str = String(value).trim();
    if (!str) return null;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(str)) {
        return str.replace('T', ' ');
    }
    return str;
};

const ensureVisitorSchema = async () => {
    try {
        const connection = await db.getConnection();
        try {
            await connection.query(`
                ALTER TABLE visitor_logs
                ADD COLUMN IF NOT EXISTS pass_token VARCHAR(255) UNIQUE AFTER status
            `);
            await connection.query(`
                ALTER TABLE visitor_logs
                ADD COLUMN IF NOT EXISTS recorded_by INT NULL AFTER status
            `);
        } finally {
            connection.release();
        }
    } catch (error) {
        console.warn('Visitor schema check warning:', error.message);
    }
};

// Register a new visitor log
const registerVisitor = async (req, res) => {
    const { name, phone, flat_id, purpose, expected_time } = req.body;
    const recorded_by = req.headers['x-user-id']; // Optional, could be resident or security
    const role = req.headers['x-user-role'];

    if (!name || !phone || !flat_id || !purpose) {
        return res.status(400).json({ message: 'Name, phone, flat_id, and purpose are required' });
    }

    const cleanName = String(name).trim();
    const cleanPhone = String(phone).trim();
    const flatId = Number(flat_id);
    const cleanPurpose = String(purpose).trim();

    if (!cleanName || !cleanPhone || !Number.isInteger(flatId) || flatId <= 0 || !cleanPurpose) {
        return res.status(400).json({ message: 'Please enter valid visitor details.' });
    }

    try {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            await ensureVisitorSchema();

            // Check if visitor exists by phone
            let [visitors] = await connection.query('SELECT id FROM visitors WHERE phone = ?', [cleanPhone]);
            let visitorId;

            if (visitors.length === 0) {
                // Insert new visitor
                const [result] = await connection.query(
                    'INSERT INTO visitors (name, phone) VALUES (?, ?)',
                    [cleanName, cleanPhone]
                );
                visitorId = result.insertId;
            } else {
                visitorId = visitors[0].id;
            }

            const status = 'EXPECTED';
            const { v4: uuidv4 } = require('uuid');
            const passToken = uuidv4();
            const normalizedExpectedTime = normalizeExpectedTime(expected_time);

            // Create visitor log
            const [logResult] = await connection.query(
                `INSERT INTO visitor_logs 
                (visitor_id, flat_id, purpose, expected_time, status, recorded_by, pass_token) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [visitorId, flatId, cleanPurpose, normalizedExpectedTime || null, status, recorded_by || null, passToken]
            );

            await connection.commit();
            res.status(201).json({ message: 'Visitor registered successfully', log_id: logResult.insertId, pass_token: passToken });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error registering visitor:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Update visitor status (Check-in / Check-out)
const updateVisitorStatus = async (req, res) => {
    const { id } = req.params; // visitor_log id
    const { status } = req.body;
    const role = req.headers['x-user-role'];

    // Allow ADMIN, SECURITY, and RESIDENT to update
    // if (role !== 'SECURITY' && role !== 'ADMIN') {
    //     return res.status(403).json({ message: 'Forbidden: Security/Admin access only' });
    // }

    if (!['CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        let updateQuery = 'UPDATE visitor_logs SET status = ?';
        let queryParams = [status];

        if (status === 'CHECKED_IN') {
            updateQuery += ', entry_time = CURRENT_TIMESTAMP';
        } else if (status === 'CHECKED_OUT') {
            updateQuery += ', exit_time = CURRENT_TIMESTAMP';
        }

        updateQuery += ' WHERE id = ?';
        queryParams.push(id);

        const [result] = await db.query(updateQuery, queryParams);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Visitor log not found' });
        }

        res.status(200).json({ message: `Visitor status updated to ${status}` });
    } catch (error) {
        console.error('Error updating visitor status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Search / Filter Visitors
const getVisitors = async (req, res) => {
    const role = req.headers['x-user-role'];
    const userId = req.headers['x-user-id'];
    const { status, date, name, flat_id } = req.query;

    try {
        let query = `
            SELECT vl.id, v.name, v.phone, f.flat_number, f.block, 
                   vl.purpose, vl.expected_time, vl.entry_time, vl.exit_time, vl.status, vl.pass_token, vl.created_at
            FROM visitor_logs vl
            JOIN visitors v ON vl.visitor_id = v.id
            JOIN flats f ON vl.flat_id = f.id
            WHERE 1=1
        `;
        
        let queryParams = [];

        // Residents can only see visitors to their flat
        if (role === 'RESIDENT') {
            const [residents] = await db.query('SELECT flat_id FROM residents WHERE user_id = ?', [userId]);
            if (residents.length > 0) {
                query += ' AND vl.flat_id = ?';
                queryParams.push(residents[0].flat_id);
            }
        } else if (flat_id) {
            query += ' AND vl.flat_id = ?';
            queryParams.push(flat_id);
        }

        // Apply filters
        if (status) {
            query += ' AND vl.status = ?';
            queryParams.push(status);
        }
        if (date) {
            query += ' AND DATE(vl.created_at) = ?';
            queryParams.push(date);
        }
        if (name) {
            query += ' AND v.name LIKE ?';
            queryParams.push(`%${name}%`);
        }

        query += ' ORDER BY vl.created_at DESC';

        const [visitors] = await db.query(query, queryParams);
        res.status(200).json(visitors);

    } catch (error) {
        console.error('Error fetching visitors:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { registerVisitor, updateVisitorStatus, getVisitors };
