const { pool } = require('../db');

async function cekKetersediaanMeja(req, res, next) {
    try {
        const result = await pool.query(`
            SELECT
                t.table_number AS id_meja,
                CASE
                    WHEN t.operational_status = 'maintenance' OR t.manual_status = 2 THEN 2
                    WHEN $1::date IS NOT NULL AND EXISTS (
                        SELECT 1
                        FROM reservations r
                        WHERE r.table_id = t.id
                          AND r.reservation_date = $1::date
                          AND r.status IN ('pending', 'confirmed', 'seated')
                          AND r.start_time < $3::time
                          AND r.end_time > $2::time
                    ) THEN 1
                    ELSE 0
                END AS status_meja,
                t.capacity
            FROM restaurant_tables t
            WHERE t.operational_status IN ('available', 'maintenance')
              AND ($4::integer IS NULL OR t.capacity >= $4::integer)
            ORDER BY t.table_number
        `, [
            req.availability?.date || null,
            req.availability?.startTime || null,
            req.availability?.endTime || null,
            req.availability?.guestCount || null,
        ]);
        return res.status(200).json({ pesan: 'Berhasil mengambil data meja.', data: result.rows });
    } catch (error) {
        return next(error);
    }
}

async function buatReservasi(req, res, next) {
    const client = await pool.connect();
    try {
        const { name, date, time, endTime, guestCount, tableNumber, notes } = req.booking;
        await client.query('BEGIN');

        const tableResult = await client.query(
            `SELECT id, table_number, capacity, operational_status, manual_status
             FROM restaurant_tables
             WHERE table_number = $1
             FOR UPDATE`,
            [tableNumber],
        );
        const table = tableResult.rows[0];

        if (!table) {
            await client.query('ROLLBACK');
            return res.status(404).json({ pesan: 'Meja tidak ditemukan.' });
        }
        if (table.operational_status !== 'available' || table.manual_status !== 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ pesan: 'Meja sedang tidak tersedia.' });
        }
        if (guestCount > table.capacity) {
            await client.query('ROLLBACK');
            return res.status(400).json({ pesan: `Kapasitas meja hanya ${table.capacity} orang.` });
        }

        const conflict = await client.query(
            `SELECT id FROM reservations
             WHERE table_id = $1
               AND reservation_date = $2
               AND status IN ('pending', 'confirmed', 'seated')
               AND start_time < $4
               AND end_time > $3
             LIMIT 1`,
            [table.id, date, time, endTime],
        );
        if (conflict.rowCount) {
            await client.query('ROLLBACK');
            return res.status(409).json({ pesan: 'Meja sudah dipesan pada rentang waktu tersebut.' });
        }

        const result = await client.query(
            `INSERT INTO reservations
                (user_id, table_id, customer_name, reservation_date, start_time, end_time, guest_count, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id, customer_name AS nama_pelanggan, reservation_date AS tanggal_reservasi,
                       start_time AS waktu_reservasi, guest_count AS jumlah_tamu,
                       table_id AS id_meja, status`,
            [req.user.id_user, table.id, name, date, time, endTime, guestCount, notes || null],
        );
        await client.query('COMMIT');

        return res.status(201).json({
            pesan: 'Reservasi berhasil dibuat.',
            data: { ...result.rows[0], id_reservasi: result.rows[0].id },
        });
    } catch (error) {
        await client.query('ROLLBACK');
        if (error.code === '23P01') {
            return res.status(409).json({ pesan: 'Meja sudah dipesan pada rentang waktu tersebut.' });
        }
        return next(error);
    } finally {
        client.release();
    }
}

async function ubahStatusMeja(req, res, next) {
    try {
        const tableNumber = Number(req.body.id_meja);
        const status = Number(req.body.status_baru);
        if (!Number.isInteger(tableNumber) || ![0, 2].includes(status)) {
            return res.status(400).json({ pesan: 'Nomor meja atau status baru tidak valid.' });
        }

        const result = await pool.query(
            `UPDATE restaurant_tables
             SET manual_status = $2
             WHERE table_number = $1
             RETURNING table_number AS id_meja,
                       CASE WHEN operational_status = 'maintenance' THEN 2 ELSE manual_status END AS status_meja,
                       capacity`,
            [tableNumber, status],
        );
        if (!result.rowCount) return res.status(404).json({ pesan: 'Meja tidak ditemukan.' });
        return res.status(200).json({
            pesan: `Status meja nomor ${tableNumber} berhasil diperbarui.`,
            data: result.rows[0],
        });
    } catch (error) {
        return next(error);
    }
}

async function getDetailReservasi(req, res, next) {
    try {
        const tableNumber = Number(req.params.id_meja);
        const result = await pool.query(
            `SELECT r.id AS id_reservasi, r.customer_name AS nama_pelanggan,
                    r.reservation_date AS tanggal_reservasi,
                    r.start_time AS waktu_reservasi, r.status AS status_reservasi,
                    r.guest_count AS jumlah_tamu
             FROM reservations r
             JOIN restaurant_tables t ON t.id = r.table_id
             WHERE t.table_number = $1
             ORDER BY r.created_at DESC
             LIMIT 1`,
            [tableNumber],
        );
        return res.status(200).json({ data: result.rows[0] || null });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    cekKetersediaanMeja,
    buatReservasi,
    ubahStatusMeja,
    getDetailReservasi,
};
