require('dotenv').config();
const express = require('express');
const cors = require('cors');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const PORT = process.env.PORT || 5007;

app.use(cors());
app.use(express.json());

app.use('/api/analytics', analyticsRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'Analytics Service' });
});

app.listen(PORT, () => {
    console.log(`Analytics Service running on port ${PORT}`);
});
