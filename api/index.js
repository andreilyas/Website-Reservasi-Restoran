const app = require('../backend/server');
const { initializeDatabase } = require('../backend/src/db');

module.exports = async function handler(req, res) {
    try {
        await initializeDatabase();
        return app(req, res);
    } catch (error) {
        console.error('Error inisialisasi DB di Vercel entrypoint:', error);
        return res.status(500).json({
            success: false,
            message: 'Database tidak siap.',
        });
    }
};
