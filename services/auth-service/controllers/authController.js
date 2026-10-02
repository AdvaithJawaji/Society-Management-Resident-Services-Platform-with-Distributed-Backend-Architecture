const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const register = async (req, res) => {
    const { username, password, role_name } = req.body;

    if (!username || !password || !role_name) {
        return res.status(400).json({ message: 'Username, password, and role_name are required' });
    }

    try {
        // Find role_id based on role_name
        const [roles] = await db.query('SELECT id FROM roles WHERE role_name = ?', [role_name.toUpperCase()]);
        if (roles.length === 0) {
            return res.status(400).json({ message: 'Invalid role' });
        }
        const role_id = roles[0].id;

        // Check if user exists
        const [existingUsers] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'Username already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        const [result] = await db.query(
            'INSERT INTO users (username, password_hash, role_id) VALUES (?, ?, ?)',
            [username, hashedPassword, role_id]
        );

        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const [users] = await db.query(`
            SELECT u.*, r.role_name 
            FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.username = ?
        `, [username]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role_name },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({ 
            message: 'Login successful', 
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role_name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getProfile = async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT u.id, u.username, r.role_name, u.created_at
            FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.id = ?
        `, [req.user.userId]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        let profile = users[0];

        // If user is resident, fetch resident details
        if (profile.role_name === 'RESIDENT') {
            const [residents] = await db.query(`
                SELECT r.name, r.phone, r.email, r.move_in_date, f.flat_number, f.block
                FROM residents r
                JOIN flats f ON r.flat_id = f.id
                WHERE r.user_id = ?
            `, [profile.id]);
            
            if (residents.length > 0) {
                profile.resident_details = residents[0];
            }
        }

        res.status(200).json(profile);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { register, login, getProfile };
