require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./src/routes/authRoutes');
const reservasiRoutes = require('./src/routes/reservasiRoutes');
const { initializeDatabase } = require('./src/db');

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
}));
app.use(express.json({ limit: '100kb' }));
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
}));

app.get('/health/live', (req, res) => res.status(200).json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/reservasi', reservasiRoutes);

app.use((req, res) => {
    res.status(404).json({ pesan: 'Endpoint tidak ditemukan.' });
});

app.use((error, req, res, next) => {
    console.error('Unhandled request error:', error);
    return res.status(500).json({ pesan: 'Terjadi kesalahan internal server.' });
});

async function startServer() {
    await initializeDatabase();
    return app.listen(PORT, () => {
        console.log(`Server berhasil berjalan di http://localhost:${PORT}`);
    });
}

if (require.main === module) {
    startServer().catch((error) => {
        console.error('Gagal memulai server:', error.message);
        process.exitCode = 1;
    });
}

module.exports = { app, startServer };
