const express = require('express');
const router = express.Router();
const { getFacilities, getBookings, bookFacility, getVehicles, registerVehicle } = require('../controllers/facilityController');

// Routes accessed via /api/facilities/* (API gateway strips service prefix & forwards full path)
router.get('/facilities', getFacilities);
router.get('/facilities/bookings', getBookings);
router.post('/facilities/bookings', bookFacility);

// Legacy direct routes (accessed directly without gateway)
router.get('/bookings', getBookings);
router.post('/bookings', bookFacility);

router.get('/vehicles', getVehicles);
router.post('/vehicles', registerVehicle);
router.get('/facilities/vehicles', getVehicles);
router.post('/facilities/vehicles', registerVehicle);

module.exports = router;
