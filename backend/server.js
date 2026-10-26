const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./src/routes/authRoutes');
const reservasiRoutes = require('./src/routes/reservasiRoutes');
const { initializeDatabase } = require('./src/db');

const app = express();
const PORT = Number(process.env.PORT || 5000);

// Inisialisasi Database agar berjalan baik di Vercel maupun Local
initializeDatabase().catch((error) => {
    console.error('Gagal menginisialisasi database:', error.message);
});

const configuredOrigins = (process.env.FRONTEND_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const allowedOrigins = [
    'https://website-reservasi-restoran.vercel.app',
    'https://website-reservasi-restoran-nb15.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    ...configuredOrigins,
].filter((origin, index, origins) => origins.indexOf(origin) === index);

const allowAllOrigins = allowedOrigins.includes('*');

// Konfigurasi Helmet untuk Cross-Origin
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Middleware CORS
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowAllOrigins || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Origin tidak diizinkan oleh kebijakan CORS.'));
    },
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
}));

// Preflight Request Handler
app.options(/.*/, (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(204);
});

app.use(express.json({ limit: '100kb' }));

app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
}));

// Health Check & Test Endpoint
app.get('/health/live', (req, res) => res.status(200).json({ status: 'ok' }));
app.get('/api/test', (req, res) => res.json({ message: 'Serverless backend Vercel aktif!' }));

// Pendaftaran Rute Dual-Prefix
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/reservasi', reservasiRoutes);
app.use('/reservasi', reservasiRoutes);

// Fallback 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint tidak ditemukan.',
    });
});

// Error Handler
app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);

    if (error.message === 'Origin tidak diizinkan oleh kebijakan CORS.') {
        return res.status(403).json({
            success: false,
            message: 'Origin tidak diizinkan.',
        });
    }

    console.error('Server Error:', error);

    return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan internal server.',
        error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
});

// Jalankan app.listen hanya jika di lingkungan lokal
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server berhasil berjalan di http://localhost:${PORT}`);
    });
}

// Ekspor langsung app untuk Vercel Serverless Function
module.exports = app;