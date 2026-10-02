require('dotenv').config();
const express = require('express');
const cors = require('cors');
const billingRoutes = require('./routes/billingRoutes');

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

app.use('/api/billing', billingRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'Billing Service' });
});

app.listen(PORT, () => {
    console.log(`Billing Service running on port ${PORT}`);
});
