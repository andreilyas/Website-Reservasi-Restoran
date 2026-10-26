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

const configuredOrigins = (process.env.FRONTEND_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const allowedOrigins = [
    'https://website-reservasi-restoran.vercel.app',    // Domain Frontend Vercel
    'https://website-reservasi-restoran-nb15.vercel.app', // Domain Backend Vercel
    'http://localhost:5173',
    'http://localhost:3000',
    ...configuredOrigins,
].filter((origin, index, origins) => origins.indexOf(origin) === index);

const allowAllOrigins = allowedOrigins.includes('*');

// Konfigurasi Helmet agar mengizinkan Cross-Origin Resource Sharing
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Middleware CORS
app.use(cors({
    origin: (origin, callback) => {
        // Izinkan request tanpa origin (seperti dari Mobile App/Postman) atau jika origin terdaftar/wildcard
        if (!origin || allowAllOrigins || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Origin tidak diizinkan oleh kebijakan CORS.'));
    },
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
}));

// Tambahkan ini tepat sebelum rute app.use('/api/auth', authRoutes);
app.options('*', (req, res) => {
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

app.get('/health/live', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/reservasi', reservasiRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint tidak ditemukan.',
    });
});

app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);

    if (error.message === 'Origin tidak diizinkan oleh kebijakan CORS.') {
        return res.status(403).json({
            success: false,
            message: 'Origin tidak diizinkan.',
        });
    }

    if (process.env.NODE_ENV !== 'production') {
        console.error(error);
    }

    return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan internal server.',
    });
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