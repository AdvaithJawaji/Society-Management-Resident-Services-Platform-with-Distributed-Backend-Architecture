const mysql = require('mysql2/promise');
require('dotenv').config({ path: './services/facility-service/.env' });

async function seedAdvanced() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'society_management'
    });

    try {
        console.log('Seeding advanced features data...');
        
        await pool.query(`
            INSERT IGNORE INTO vehicles (resident_id, vehicle_number, type) 
            VALUES 
            (1, 'MH-01-AB-1234', '4_WHEELER'), 
            (2, 'MH-02-CD-5678', '2_WHEELER');
        `);
        console.log('Vehicles seeded.');

        await pool.query(`
            INSERT IGNORE INTO facility_bookings (resident_id, facility_id, booking_date, time_slot, status) 
            VALUES 
            (1, 1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '18:00 - 22:00', 'CONFIRMED'), 
            (2, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '07:00 - 08:00', 'CONFIRMED');
        `);
        console.log('Facility bookings seeded.');

        await pool.query(`
            INSERT IGNORE INTO audit_logs (user_id, action, details, ip_address) 
            VALUES 
            (1, 'SYSTEM_INIT', 'Advanced features initialized', '127.0.0.1');
        `);
        console.log('Audit log seeded.');

        console.log('Done!');
    } catch (e) {
        console.error('Error:', e);
    } finally {
        pool.end();
    }
}

seedAdvanced();
