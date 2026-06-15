// server.js
const express = require('express');
const cors = require('cors');
const reservasiRoutes = require('./src/routes/reservasiRoutes');

// 1. TAMBAHKAN BARIS INI: Import jalur (routes) untuk otentikasi/login
const authRoutes = require('./src/routes/authRoutes'); 

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Agar server bisa membaca data berbentuk JSON dari frontend

// Gunakan jalur (routes) yang sudah kita pisahkan
app.use('/api/reservasi', reservasiRoutes);

// 2. TAMBAHKAN BARIS INI: Daftarkan jalur /api/auth ke dalam server
app.use('/api/auth', authRoutes); 

// Jalankan server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server berhasil berjalan di http://localhost:${PORT}`);
});