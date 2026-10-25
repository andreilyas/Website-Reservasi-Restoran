const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

function createToken(user) {
    return jwt.sign(
        { id_user: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '2h' },
    );
}

async function login(req, res, next) {
    try {
        const { username, password } = req.body;
        const result = await pool.query(
            'SELECT id, username, password_hash, role FROM users WHERE username = $1',
            [username],
        );
        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ pesan: 'Username atau password salah.' });
        }

        return res.status(200).json({
            pesan: 'Login berhasil.',
            token: createToken(user),
            data: { id_user: user.id, username: user.username, role: user.role },
        });
    } catch (error) {
        return next(error);
    }
}

async function register(req, res, next) {
    try {
        const { username, password } = req.body;
        const passwordHash = await bcrypt.hash(password, 12);
        const result = await pool.query(
            `INSERT INTO users (username, password_hash, role)
             VALUES ($1, $2, 'tamu')
             RETURNING id, username, role`,
            [username, passwordHash],
        );

        return res.status(201).json({
            pesan: 'Registrasi berhasil. Silakan masuk menggunakan akun baru Anda.',
            data: {
                id_user: result.rows[0].id,
                username: result.rows[0].username,
                role: result.rows[0].role,
            },
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ pesan: 'Username sudah terdaftar.' });
        }
        return next(error);
    }
}

module.exports = { login, register };
