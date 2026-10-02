require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const visitorRoutes = require('./routes/visitorRoutes');

const app = express();
const PORT = process.env.PORT || 5003;

const ensureDatabase = async () => {
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'society_management'
    };

    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.query(`
            CREATE TABLE IF NOT EXISTS visitors (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                phone VARCHAR(20) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await connection.query(`
            CREATE TABLE IF NOT EXISTS visitor_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                visitor_id INT NOT NULL,
                flat_id INT NOT NULL,
                purpose VARCHAR(255) NOT NULL,
                expected_time DATETIME,
                entry_time DATETIME,
                exit_time DATETIME,
                status ENUM('EXPECTED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED') DEFAULT 'EXPECTED',
                recorded_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                pass_token VARCHAR(255) UNIQUE,
                FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE RESTRICT,
                FOREIGN KEY (flat_id) REFERENCES flats(id) ON DELETE RESTRICT
            )
        `);
        await connection.end();
    } catch (error) {
        console.warn('Database bootstrap warning:', error.message);
    }
};

app.use(cors());
app.use(express.json());

app.use('/api/visitors', visitorRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'Visitor Service' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

ensureDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Visitor Service running on port ${PORT}`);
    });
});
