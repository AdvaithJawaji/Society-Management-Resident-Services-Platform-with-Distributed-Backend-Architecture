require('dotenv').config();
const express = require('express');
const cors = require('cors');
const notificationRoutes = require('./routes/notificationRoutes');

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 5005;

app.use(cors());
app.use(express.json());

// Pass io to routes via req
app.use((req, res, next) => {
    req.io = io;
    next();
});

const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    host: 'localhost', user: 'root', password: 'root', database: 'society_management'
});

// Email Simulator Cron
setInterval(async () => {
    try {
        const [emails] = await pool.query("SELECT * FROM email_outbox WHERE status = 'PENDING' LIMIT 5");
        if (emails.length > 0) {
            for (let email of emails) {
                console.log(`[EMAIL SIMULATOR] 📧 Sending email to: ${email.recipient_email} | Subject: ${email.subject}`);
                await pool.query("UPDATE email_outbox SET status = 'SENT', sent_at = NOW() WHERE id = ?", [email.id]);
            }
        }
    } catch (e) {
        console.error('Email cron error:', e);
    }
}, 10000); // Check every 10 seconds

app.use('/api/notifications', notificationRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'Notification Service' });
});

io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    try {
        const response = await fetch('http://localhost:5001/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) return next(new Error('Authentication failed'));
        const user = await response.json();
        socket.data.userId = Number(user.id);
        next();
    } catch {
        next(new Error('Authentication failed'));
    }
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Client joins room based on their user_id
    socket.on('join', (userId) => {
        if (Number(userId) !== socket.data.userId) return;
        socket.join(`user_${socket.data.userId}`);
        console.log(`User ${socket.data.userId} joined room`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Notification Service (with WS) running on port ${PORT}`);
});
