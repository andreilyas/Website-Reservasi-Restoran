const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 10,
});

async function initializeDatabase() {
    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL tidak ditemukan');
        return;
    }

    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS restaurant_tables (
                id BIGSERIAL PRIMARY KEY,
                table_number INTEGER NOT NULL UNIQUE CHECK (table_number > 0),
                capacity INTEGER NOT NULL DEFAULT 4 CHECK (capacity > 0),
                operational_status VARCHAR(20) NOT NULL DEFAULT 'available',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

        await pool.query(`
            INSERT INTO restaurant_tables (table_number, capacity)
            SELECT number, 4
            FROM generate_series(1, 15) AS number
            ON CONFLICT (table_number) DO NOTHING;
        `);
        console.log('Database terhubung & terinisialisasi.');
    } catch (err) {
        console.error('Database Init Error:', err.message);
    }
}

module.exports = { pool, initializeDatabase };