const db = require('../config/db');

// Financial Analytics
const getFinancialStats = async (req, res) => {
    try {
        const [paid] = await db.query("SELECT SUM(amount) as total FROM maintenance_bills WHERE status = 'PAID'");
        const [pending] = await db.query("SELECT SUM(amount) as total FROM maintenance_bills WHERE status IN ('UNPAID', 'OVERDUE')");
        const revenue = Number(paid[0].total) || 0;
        const pendingDues = Number(pending[0].total) || 0;
        const totalBilled = revenue + pendingDues;
        
        res.status(200).json({
            revenue,
            pending_dues: pendingDues,
            collection_rate: totalBilled === 0 ? '0.00' : ((revenue / totalBilled) * 100).toFixed(2)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Complaint Insights
const getComplaintInsights = async (req, res) => {
    try {
        const [statusCounts] = await db.query("SELECT status, COUNT(*) as count FROM complaints GROUP BY status");
        const [categoryCounts] = await db.query("SELECT category, COUNT(*) as count FROM complaints GROUP BY category");
        
        const data = {
            by_status: statusCounts.reduce((acc, row) => ({ ...acc, [row.status]: row.count }), {}),
            by_category: categoryCounts.map(row => ({ name: row.category, value: row.count }))
        };
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Events
const getEvents = async (req, res) => {
    try {
        const [events] = await db.query("SELECT * FROM events ORDER BY event_date ASC");
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Service Providers
const getProviders = async (req, res) => {
    try {
        const [providers] = await db.query("SELECT * FROM service_providers ORDER BY rating DESC");
        res.status(200).json(providers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Feedback
const getFeedback = async (req, res) => {
    try {
        const [feedback] = await db.query(`
            SELECT f.*, r.name as resident_name 
            FROM feedback f 
            JOIN residents r ON f.resident_id = r.id 
            ORDER BY f.created_at DESC
        `);
        res.status(200).json(feedback);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getFinancialStats, getComplaintInsights, getEvents, getProviders, getFeedback };
