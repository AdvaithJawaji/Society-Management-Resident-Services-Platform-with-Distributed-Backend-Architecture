require('dotenv').config();
const express = require('express');
const cors = require('cors');
const facilityRoutes = require('./routes/facilityRoutes');

const app = express();
const PORT = process.env.PORT || 5006;

app.use(cors());
app.use(express.json());

app.use('/api', facilityRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'Facility Service' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.listen(PORT, () => {
    console.log(`Facility Service running on port ${PORT}`);
});
