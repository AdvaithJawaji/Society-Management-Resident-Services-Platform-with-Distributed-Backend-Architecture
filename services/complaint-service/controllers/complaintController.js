const db = require('../config/db');

// Create a new complaint (Residents only)
const createComplaint = async (req, res) => {
    const { title, category, description, priority } = req.body;
    const userId = req.headers['x-user-id'];
    const role = req.headers['x-user-role'];

    if (role !== 'RESIDENT') {
        return res.status(403).json({ message: 'Forbidden: Only residents can create complaints' });
    }

    if (!title || !category || !description) {
        return res.status(400).json({ message: 'Title, category, and description are required' });
    }

    try {
        // Find resident and flat details
        const [residents] = await db.query('SELECT id, flat_id FROM residents WHERE user_id = ?', [userId]);
        if (residents.length === 0) {
            return res.status(404).json({ message: 'Resident profile not found' });
        }
        
        const resident_id = residents[0].id;
        const flat_id = residents[0].flat_id;

        const [result] = await db.query(
            `INSERT INTO complaints (resident_id, flat_id, title, category, description, priority) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [resident_id, flat_id, title, category, description, priority || 'LOW']
        );

        res.status(201).json({ message: 'Complaint registered successfully', complaint_id: result.insertId });
    } catch (error) {
        console.error('Error creating complaint:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Update complaint status or assign staff (Admins only)
const updateComplaint = async (req, res) => {
    const { id } = req.params;
    const { status, assigned_to } = req.body;
    const role = req.headers['x-user-role'];

    if (role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden: Only admins can manage complaints' });
    }

    if (!status && !assigned_to) {
        return res.status(400).json({ message: 'Nothing to update' });
    }

    try {
        let updateFields = [];
        let queryParams = [];

        if (status) {
            updateFields.push('status = ?');
            queryParams.push(status);
        }
        if (assigned_to !== undefined) {
            updateFields.push('assigned_to = ?');
            queryParams.push(assigned_to);
        }

        queryParams.push(id);
        const updateQuery = `UPDATE complaints SET ${updateFields.join(', ')} WHERE id = ?`;

        const [result] = await db.query(updateQuery, queryParams);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        res.status(200).json({ message: 'Complaint updated successfully' });
    } catch (error) {
        console.error('Error updating complaint:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Get complaints (Admins see all, Residents see their own)
const getComplaints = async (req, res) => {
    const role = req.headers['x-user-role'];
    const userId = req.headers['x-user-id'];

    try {
        // SLA Computation logic (Flag HIGH priority > 24 hours)
        await db.query(`
            UPDATE complaints 
            SET sla_breached = TRUE 
            WHERE priority = 'HIGH' AND status = 'OPEN' 
            AND created_at < NOW() - INTERVAL 1 DAY
        `);

        let query = `
            SELECT c.*, f.flat_number, r.name as resident_name, r.user_id as resident_user_id, u.username as assigned_staff 
            FROM complaints c
            JOIN flats f ON c.flat_id = f.id
            JOIN residents r ON c.resident_id = r.id
            LEFT JOIN users u ON c.assigned_to = u.id
        `;

        let queryParams = [];

        if (role === 'RESIDENT') {
            const [residents] = await db.query('SELECT id FROM residents WHERE user_id = ?', [userId]);
            if (residents.length === 0) {
                return res.status(404).json({ message: 'Resident profile not found' });
            }
            query += ' WHERE c.resident_id = ?';
            queryParams.push(residents[0].id);
        }

        query += ' ORDER BY c.created_at DESC';

        const [complaints] = await db.query(query, queryParams);
        res.status(200).json(complaints);
    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = { createComplaint, updateComplaint, getComplaints };
