const app = require('../backend/server');
const { initializeDatabase } = require('../backend/src/db');

// Inisialisasi Database secara aman saat serverless function dipanggil
initializeDatabase().catch((err) => {
    console.error('Error inisialisasi DB di Vercel entrypoint:', err);
});

module.exports = app;