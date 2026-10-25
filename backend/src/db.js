const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const requiredEnv = ['DATABASE_URL', 'JWT_SECRET'];
for (const key of requiredEnv) {
    if (!process.env[key]) {
        throw new Error(`${key} wajib dikonfigurasi sebelum backend dijalankan.`);
    }
}
if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET harus memiliki panjang minimal 32 karakter.');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    max: Number(process.env.DB_POOL_MAX || 10),
});

async function initializeDatabase() {
    await pool.query('CREATE EXTENSION IF NOT EXISTS btree_gist');
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

        CREATE INDEX IF NOT EXISTS reservations_table_schedule_idx
            ON reservations (table_id, reservation_date, start_time, end_time);
        CREATE INDEX IF NOT EXISTS reservations_user_idx ON reservations (user_id);
    `);
    await pool.query(`
        ALTER TABLE restaurant_tables
        ADD COLUMN IF NOT EXISTS manual_status INTEGER NOT NULL DEFAULT 0;
    `);
    await pool.query(`
        ALTER TABLE reservations
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    `);
    await pool.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint
                WHERE conname = 'reservations_no_active_overlap'
            ) THEN
                ALTER TABLE reservations
                ADD CONSTRAINT reservations_no_active_overlap
                EXCLUDE USING gist (
                    table_id WITH =,
                    tsrange(
                        (reservation_date + start_time)::timestamp,
                        (reservation_date + end_time)::timestamp,
                        '[)'
                    ) WITH &&
                )
                WHERE (status IN ('pending', 'confirmed', 'seated'));
            END IF;
        END $$;
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
}

module.exports = { pool, initializeDatabase };
