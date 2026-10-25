-- RestoKalcer - PostgreSQL schema
-- Jalankan pada database yang sudah dibuat, misalnya: restokalcer
--
-- Catatan:
-- 1. Jangan menyimpan password plaintext di file SQL.
-- 2. Buat admin melalui ADMIN_USERNAME dan ADMIN_PASSWORD di backend/.env,
--    atau masukkan bcrypt hash pada contoh INSERT yang dikomentari di bawah.
-- 3. Script ini aman dijalankan ulang karena menggunakan IF NOT EXISTS/ON CONFLICT.

BEGIN;

CREATE EXTENSION IF NOT EXISTS btree_gist;

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
    manual_status INTEGER NOT NULL DEFAULT 0
        CHECK (manual_status IN (0, 2)),
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
        CHECK (status IN (
            'pending',
            'confirmed',
            'seated',
            'completed',
            'cancelled',
            'no_show'
        )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS reservations_table_schedule_idx
    ON reservations (table_id, reservation_date, start_time, end_time);

CREATE INDEX IF NOT EXISTS reservations_user_idx
    ON reservations (user_id);

CREATE INDEX IF NOT EXISTS reservations_date_status_idx
    ON reservations (reservation_date, status);

-- Mencegah dua reservasi aktif pada meja dan rentang waktu yang sama.
-- Rentang menggunakan [): 19:00-21:00 tidak konflik dengan 21:00-23:00.
ALTER TABLE reservations
    DROP CONSTRAINT IF EXISTS reservations_no_active_overlap;

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

-- Seed 15 meja awal. Ubah capacity setelah seed jika kebutuhan restoran berbeda.
INSERT INTO restaurant_tables (table_number, capacity)
SELECT table_number, 4
FROM generate_series(1, 15) AS table_number
ON CONFLICT (table_number) DO NOTHING;

-- Contoh insert admin menggunakan bcrypt hash.
-- Ganti <BCRYPT_HASH> dengan hasil bcryptjs.hash(password, 12).
-- Lebih disarankan memakai ADMIN_USERNAME/ADMIN_PASSWORD pada backend/.env.
--
-- INSERT INTO users (username, password_hash, role)
-- VALUES ('admin', '<BCRYPT_HASH>', 'admin')
-- ON CONFLICT (username) DO NOTHING;

COMMIT;

-- Verifikasi schema dan seed:
-- SELECT id, username, role, created_at FROM users ORDER BY id;
-- SELECT table_number, capacity, operational_status, manual_status
-- FROM restaurant_tables ORDER BY table_number;
-- SELECT id, user_id, table_id, reservation_date, start_time, end_time, status
-- FROM reservations ORDER BY id;
