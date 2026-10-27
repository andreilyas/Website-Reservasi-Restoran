const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Vercel / Supabase mewajibkan SSL dengan rejectUnauthorized: false
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: Number(process.env.DB_POOL_MAX || 10),
});

let initializationPromise;

async function initializeDatabase() {
    if (initializationPromise) return initializationPromise;

    initializationPromise = setupDatabase();
    try {
        await initializationPromise;
    } catch (error) {
        initializationPromise = undefined;
        throw error;
    }
}

async function setupDatabase() {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL tidak ditemukan');
    }

    try {
        // Buat tabel utama tanpa melempar error btree_gist jika tidak ada izin di Supabase
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id BIGSERIAL PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role VARCHAR(20) NOT NULL DEFAULT 'tamu'
                    CHECK (role IN ('tamu', 'receptionist', 'admin')),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS restaurant_tables (
                id BIGSERIAL PRIMARY KEY,
                table_number INTEGER NOT NULL UNIQUE CHECK (table_number > 0),
                capacity INTEGER NOT NULL DEFAULT 4 CHECK (capacity > 0),
                operational_status VARCHAR(20) NOT NULL DEFAULT 'available'
                    CHECK (operational_status IN ('available', 'maintenance')),
                manual_status INTEGER NOT NULL DEFAULT 0 CHECK (manual_status IN (0, 2)),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS reservations (
                id BIGSERIAL PRIMARY KEY,
                user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
                table_id BIGINT NOT NULL REFERENCES restaurant_tables(id) ON DELETE RESTRICT,
                customer_name VARCHAR(100) NOT NULL,
                reservation_date DATE NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                guest_count INTEGER NOT NULL DEFAULT 1 CHECK (guest_count > 0),
                notes VARCHAR(500),
                status VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show')),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                CHECK (end_time > start_time)
            );
        `);

        await pool.query(`
            INSERT INTO restaurant_tables (table_number, capacity)
            SELECT number, 4
            FROM generate_series(1, 15) AS number
            ON CONFLICT (table_number) DO NOTHING;
        `);

        if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
            const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
            await pool.query(
                `INSERT INTO users (username, password_hash, role)
                 VALUES ($1, $2, 'admin')
                 ON CONFLICT (username) DO NOTHING`,
                [process.env.ADMIN_USERNAME.trim().toLowerCase(), passwordHash],
            );
        }
        console.log('Database terhubung & terinisialisasi.');
    } catch (err) {
        console.error('Database Init Error:', err.message);
        throw err;
    }
}

module.exports = { pool, initializeDatabase };