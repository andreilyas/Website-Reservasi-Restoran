// src/routes/reservasiRoutes.js
const express = require('express');
const router = express.Router();
const { cekKetersediaanMeja, buatReservasi, ubahStatusMeja, getDetailReservasi } = require('../controllers/reservasiController');

// Jika ada request GET ke /api/reservasi/meja, jalankan fungsi cekKetersediaanMeja
router.get('/meja', cekKetersediaanMeja);

// Jika ada request POST ke /api/reservasi/booking, jalankan fungsi buatReservasi
router.post('/booking', buatReservasi);

// Jika ada request PUT ke /api/reservasi/update-status, jalankan fungsi ubahStatusMeja
router.put('/update-status', ubahStatusMeja);

// Jika ada request GET ke /api/reservasi/detail/:id_meja, jalankan fungsi getDetailReservasi
router.get('/detail/:id_meja', getDetailReservasi);

module.exports = router;