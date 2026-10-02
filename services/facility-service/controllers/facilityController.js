const db = require('../config/db');

// ---- FACILITY BOOKING ----

const getFacilities = async (req, res) => {
    console.log("getFacilities route hit");
    try {
        console.log("Attempting db.query");
        const [facilities] = await db.query('SELECT id, name, capacity, status, timing, description, booking_fee, created_at FROM facilities ORDER BY id');
        console.log(`Fetched ${facilities.length} facilities`);
        res.status(200).json(facilities);
    } catch (error) {
        console.error("Error in getFacilities:", error);
        res.status(500).json({ message: 'Error fetching facilities', error: error.message });
    }
};

const getBookings = async (req, res) => {
    const role = req.headers['x-user-role'];
    const userId = req.headers['x-user-id'];

    try {
        let query = `
            SELECT b.*, f.name as facility_name, r.name as resident_name 
            FROM facility_bookings b
            JOIN facilities f ON b.facility_id = f.id
            JOIN residents r ON b.resident_id = r.id
        `;
        let params = [];

        if (role === 'RESIDENT') {
            const [residents] = await db.query('SELECT id FROM residents WHERE user_id = ?', [userId]);
            if (residents.length > 0) {
                query += ' WHERE b.resident_id = ?';
                params.push(residents[0].id);
            }
        }

        query += ' ORDER BY b.booking_date DESC';
        const [bookings] = await db.query(query, params);
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings', error: error.message });
    }
};

const bookFacility = async (req, res) => {
    const { facility_id, booking_date, time_slot } = req.body;
    const role = req.headers['x-user-role'];
    const userId = req.headers['x-user-id'];

    if (role !== 'RESIDENT') {
        return res.status(403).json({ message: 'Facility bookings are available to resident accounts only.' });
    }

    try {
        const [residents] = await db.query('SELECT id FROM residents WHERE user_id = ?', [userId]);
        if (residents.length === 0) return res.status(404).json({ message: 'Resident not found' });
        
        const resident_id = residents[0].id;

        // Check if slot is already booked
        const [existing] = await db.query(
            'SELECT id FROM facility_bookings WHERE facility_id = ? AND booking_date = ? AND time_slot = ? AND status = "CONFIRMED"',
            [facility_id, booking_date, time_slot]
        );

        if (existing.length > 0) {
            return res.status(409).json({ message: 'Time slot already booked' });
        }

        const [result] = await db.query(
            'INSERT INTO facility_bookings (resident_id, facility_id, booking_date, time_slot) VALUES (?, ?, ?, ?)',
            [resident_id, facility_id, booking_date, time_slot]
        );

        res.status(201).json({ message: 'Facility booked successfully', booking_id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Error booking facility', error: error.message });
    }
};

// ---- VEHICLE MANAGEMENT ----

const getVehicles = async (req, res) => {
    const role = req.headers['x-user-role'];
    const userId = req.headers['x-user-id'];

    try {
        let query = `
            SELECT v.*, v.parking_slot, r.name as resident_name, f.flat_number 
            FROM vehicles v
            JOIN residents r ON v.resident_id = r.id
            JOIN flats f ON r.flat_id = f.id
        `;
        let params = [];

        if (role === 'RESIDENT') {
            const [residents] = await db.query('SELECT id FROM residents WHERE user_id = ?', [userId]);
            if (residents.length > 0) {
                query += ' WHERE v.resident_id = ?';
                params.push(residents[0].id);
            }
        }

        const [vehicles] = await db.query(query, params);
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vehicles', error: error.message });
    }
};

const registerVehicle = async (req, res) => {
    const { vehicle_number, type } = req.body;
    const userId = req.headers['x-user-id'];

    try {
        const [residents] = await db.query('SELECT id FROM residents WHERE user_id = ?', [userId]);
        if (residents.length === 0) return res.status(404).json({ message: 'Resident not found' });
        
        const resident_id = residents[0].id;

        const [result] = await db.query(
            'INSERT INTO vehicles (resident_id, vehicle_number, type) VALUES (?, ?, ?)',
            [resident_id, vehicle_number, type]
        );

        res.status(201).json({ message: 'Vehicle registered successfully', vehicle_id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Error registering vehicle', error: error.message });
    }
};

module.exports = { getFacilities, getBookings, bookFacility, getVehicles, registerVehicle };
