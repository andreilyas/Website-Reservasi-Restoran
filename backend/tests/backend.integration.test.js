const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const test = require('node:test');
const request = require('supertest');
const { app } = require('../server');
const { pool, initializeDatabase } = require('../src/db');

const username = `test_${Date.now()}_${crypto.randomInt(1000, 9999)}`;
const password = 'testpassword123';
const reservationDate = '2099-12-15';
let customerToken;
let adminToken;
let customerId;
const reservationIds = [];

test.before(async () => {
    await initializeDatabase();

    const register = await request(app)
        .post('/api/auth/register')
        .send({ username, password });
    assert.equal(register.status, 201);
    customerId = register.body.data.id_user;

    const customerLogin = await request(app)
        .post('/api/auth/login')
        .send({ username, password });
    assert.equal(customerLogin.status, 200);
    customerToken = customerLogin.body.token;

    const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({
            username: process.env.ADMIN_USERNAME,
            password: process.env.ADMIN_PASSWORD,
        });
    assert.equal(adminLogin.status, 200);
    adminToken = adminLogin.body.token;
});

test.after(async () => {
    if (reservationIds.length) {
        await pool.query('DELETE FROM reservations WHERE id = ANY($1::bigint[])', [reservationIds]);
    }
    if (customerId) {
        await pool.query('DELETE FROM users WHERE id = $1', [customerId]);
    }
    await pool.end();
});

test('public table availability supports date, time, and capacity filters', async () => {
    const response = await request(app)
        .get('/api/reservasi/meja')
        .query({
            date: reservationDate,
            start_time: '19:00',
            end_time: '21:00',
            guest_count: 4,
        });

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body.data));
    assert.equal(response.body.data.length, 15);
    assert.equal(response.body.data[0].status_meja, 0);
});

test('invalid availability filters are rejected', async () => {
    const response = await request(app)
        .get('/api/reservasi/meja')
        .query({ date: reservationDate, start_time: '09:00', end_time: '11:00', guest_count: 4 });

    assert.equal(response.status, 400);
});

test('booking requires a valid JWT', async () => {
    const response = await request(app)
        .post('/api/reservasi/booking')
        .send({
            nama_pelanggan: 'Tanpa Token',
            tanggal_reservasi: reservationDate,
            waktu_reservasi: '19:00',
            waktu_selesai: '21:00',
            jumlah_tamu: 2,
            id_meja: 13,
        });

    assert.equal(response.status, 401);
});

test('invalid JWT is rejected', async () => {
    const response = await request(app)
        .post('/api/reservasi/booking')
        .set('Authorization', 'Bearer invalid.token.value')
        .send({
            nama_pelanggan: 'Token Invalid',
            tanggal_reservasi: reservationDate,
            waktu_reservasi: '19:00',
            waktu_selesai: '21:00',
            jumlah_tamu: 2,
            id_meja: 12,
        });

    assert.equal(response.status, 401);
});

test('customer can book once and overlapping booking is rejected', async () => {
    const payload = {
        nama_pelanggan: 'Integration Customer',
        tanggal_reservasi: reservationDate,
        waktu_reservasi: '19:00',
        waktu_selesai: '21:00',
        jumlah_tamu: 2,
        id_meja: 13,
    };

    const first = await request(app)
        .post('/api/reservasi/booking')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(payload);
    assert.equal(first.status, 201);
    reservationIds.push(first.body.data.id_reservasi);

    const availability = await request(app)
        .get('/api/reservasi/meja')
        .query({
            date: reservationDate,
            start_time: '19:00',
            end_time: '21:00',
            guest_count: 2,
        });
    const bookedTable = availability.body.data.find((table) => table.id_meja === 13);
    assert.equal(bookedTable.status_meja, 1);

    const duplicate = await request(app)
        .post('/api/reservasi/booking')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(payload);
    assert.equal(duplicate.status, 409);
});

test('overlapping concurrent bookings allow only one reservation', async () => {
    const payload = {
        nama_pelanggan: 'Concurrent Customer',
        tanggal_reservasi: '2099-12-16',
        waktu_reservasi: '19:00',
        waktu_selesai: '21:00',
        jumlah_tamu: 2,
        id_meja: 14,
    };

    const responses = await Promise.all([
        request(app).post('/api/reservasi/booking')
            .set('Authorization', `Bearer ${customerToken}`).send(payload),
        request(app).post('/api/reservasi/booking')
            .set('Authorization', `Bearer ${customerToken}`).send(payload),
    ]);
    const successes = responses.filter((response) => response.status === 201);
    const conflicts = responses.filter((response) => response.status === 409);

    assert.equal(successes.length, 1);
    assert.equal(conflicts.length, 1);
    reservationIds.push(successes[0].body.data.id_reservasi);
});

test('customer cannot access admin table mutation', async () => {
    const response = await request(app)
        .put('/api/reservasi/update-status')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ id_meja: 15, status_baru: 2 });

    assert.equal(response.status, 403);
});

test('admin can mutate table status and the change persists', async () => {
    const update = await request(app)
        .put('/api/reservasi/update-status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ id_meja: 15, status_baru: 2 });
    assert.equal(update.status, 200);
    assert.equal(update.body.data.status_meja, 2);

    const table = await pool.query(
        'SELECT manual_status FROM restaurant_tables WHERE table_number = $1',
        [15],
    );
    assert.equal(table.rows[0].manual_status, 2);

    await request(app)
        .put('/api/reservasi/update-status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ id_meja: 15, status_baru: 0 });
});
