const express = require('express');
const {
    cekKetersediaanMeja,
    buatReservasi,
    ubahStatusMeja,
    getDetailReservasi,
} = require('../controllers/reservasiController');
const { requireAuth, requireRole } = require('../middleware/auth');
const { validateBooking, validateAvailabilityQuery } = require('../middleware/validation');

const router = express.Router();

router.get('/meja', validateAvailabilityQuery, cekKetersediaanMeja);
router.post('/booking', requireAuth, validateBooking, buatReservasi);
router.put('/update-status', requireAuth, requireRole('admin', 'receptionist'), ubahStatusMeja);
router.get('/detail/:id_meja', requireAuth, requireRole('admin', 'receptionist'), getDetailReservasi);

module.exports = router;
