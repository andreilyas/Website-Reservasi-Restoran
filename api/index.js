const app = require('../backend/server');
const { initializeDatabase } = require('../backend/src/db');

// Pastikan koneksi database diinisialisasi saat fungsi serverless dipanggil
initializeDatabase().catch((err) => {
    console.error('Error inisialisasi DB di Vercel entrypoint:', err);
});

module.exports = app;