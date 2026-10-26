// Muat dotenv langsung dari node_modules backend
try {
  require('../backend/node_modules/dotenv').config();
} catch (e) {
  // Abaikan jika berjalan di Vercel Production
}

const app = require('../backend/server');
const { initializeDatabase } = require('../backend/src/db');

// Inisialisasi DB secara aman
initializeDatabase().catch((err) => {
    console.error('Error inisialisasi DB di Vercel entrypoint:', err);
});

module.exports = app;