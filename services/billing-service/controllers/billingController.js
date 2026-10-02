const db = require('../config/db');

// Generate monthly bills for all flats (Admin only)
const generateBills = async (req, res) => {
    // Check role passed from API Gateway
    const role = req.headers['x-user-role'];
    if (role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden: Admins only' });
    }

    const { billing_month, due_date, amount_2bhk, amount_3bhk } = req.body;

    if (!billing_month || !due_date || !amount_2bhk || !amount_3bhk) {
        return res.status(400).json({ message: 'Missing required billing parameters' });
    }

    try {
        // Call the MySQL stored procedure
        await db.query('CALL GenerateMonthlyMaintenanceBills(?, ?, ?, ?)', [
            billing_month, due_date, amount_2bhk, amount_3bhk
        ]);
        
        res.status(201).json({ message: 'Monthly bills generated successfully' });
    } catch (error) {
        console.error('Error generating bills:', error);
        res.status(500).json({ message: 'Failed to generate bills', error: error.message });
    }
};

// Get all bills or filter by flat/resident
const getBills = async (req, res) => {
    const role = req.headers['x-user-role'];
    const userId = req.headers['x-user-id'];
    
    try {
        if (role === 'RESIDENT') {
            // Residents can only see their own bills
            const [bills] = await db.query(`
                SELECT b.*, f.flat_number 
                FROM maintenance_bills b
                JOIN flats f ON b.flat_id = f.id
                JOIN residents r ON f.id = r.flat_id
                WHERE r.user_id = ?
                ORDER BY b.billing_month DESC
            `, [userId]);
            return res.status(200).json(bills);
        } else {
            // Admins can see all bills
            const [bills] = await db.query(`
                SELECT b.*, f.flat_number, f.block
                FROM maintenance_bills b
                JOIN flats f ON b.flat_id = f.id
                ORDER BY b.billing_month DESC
            `);
            return res.status(200).json(bills);
        }
    } catch (error) {
        console.error('Error fetching bills:', error);
        res.status(500).json({ message: 'Failed to fetch bills' });
    }
};

// Process payment with MySQL Transaction
const processPayment = async (req, res) => {
    const { bill_id, amount, payment_method, transaction_ref } = req.body;
    const userId = req.headers['x-user-id'];

    if (!bill_id || !amount) {
        return res.status(400).json({ message: 'Bill ID and amount are required' });
    }

    const connection = await db.getConnection();
    
    try {
        // 1. Get resident ID from user ID
        const [residents] = await connection.query('SELECT id FROM residents WHERE user_id = ?', [userId]);
        if (residents.length === 0) {
            connection.release();
            return res.status(404).json({ message: 'Resident profile not found' });
        }
        const residentId = residents[0].id;

        // START TRANSACTION
        await connection.beginTransaction();

        // 2. Insert payment record
        await connection.query(
            'INSERT INTO payments (bill_id, resident_id, amount, payment_method, transaction_ref) VALUES (?, ?, ?, ?, ?)',
            [bill_id, residentId, amount, payment_method || 'ONLINE', transaction_ref || `TRX-${Date.now()}`]
        );

        // Note: The MySQL trigger 'after_payment_insert' automatically checks if the bill is fully paid 
        // and updates the maintenance_bills status to 'PAID'. No need to do it here manually!

        // COMMIT TRANSACTION
        await connection.commit();
        
        res.status(200).json({ message: 'Payment processed successfully' });
    } catch (error) {
        // ROLLBACK ON ERROR
        await connection.rollback();
        console.error('Payment error:', error);
        res.status(500).json({ message: 'Payment failed, transaction rolled back', error: error.message });
    } finally {
        connection.release();
    }
};

module.exports = { generateBills, getBills, processPayment };
