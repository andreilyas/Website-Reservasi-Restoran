function validateRegistration(req, res, next) {
    const { username, password } = req.body || {};
    if (typeof username !== 'string' || !/^[a-zA-Z0-9_]{3,50}$/.test(username.trim())) {
        return res.status(400).json({ pesan: 'Username harus 3-50 karakter alfanumerik atau underscore.' });
    }
    if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
        return res.status(400).json({ pesan: 'Password harus terdiri dari 8-128 karakter.' });
    }
    req.body.username = username.trim().toLowerCase();
    return next();
}

function validateLogin(req, res, next) {
    const { username, password } = req.body || {};
    if (typeof username !== 'string' || typeof password !== 'string' || !username.trim() || !password) {
        return res.status(400).json({ pesan: 'Username dan password wajib diisi.' });
    }
    req.body.username = username.trim().toLowerCase();
    return next();
}

function validateBooking(req, res, next) {
    const {
        nama_pelanggan: name,
        tanggal_reservasi: date,
        waktu_reservasi: time = '19:00',
        waktu_selesai: endTime,
        jumlah_tamu: guestCount = 1,
        id_meja: tableNumber,
        catatan: notes = '',
    } = req.body || {};

    const parsedGuests = Number(guestCount);
    const table = Number(tableNumber);
    const validDate = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date);
    const validTime = typeof time === 'string' && /^\d{2}:\d{2}$/.test(time);
    const safeTime = typeof time === 'string' ? time : '00:00';
    const normalizedEnd = endTime || `${String(Number(safeTime.slice(0, 2)) + 2).padStart(2, '0')}:${safeTime.slice(3)}`;
    const startMinutes = validTime ? Number(safeTime.slice(0, 2)) * 60 + Number(safeTime.slice(3)) : -1;
    const endMinutes = /^\d{2}:\d{2}$/.test(normalizedEnd)
        ? Number(normalizedEnd.slice(0, 2)) * 60 + Number(normalizedEnd.slice(3))
        : -1;
    const today = new Date().toISOString().split('T')[0];

    if (typeof name !== 'string' || !name.trim() || name.trim().length > 100) {
        return res.status(400).json({ pesan: 'Nama pelanggan wajib diisi dan maksimal 100 karakter.' });
    }
    if (!validDate || date < today || !validTime || !/^\d{2}:\d{2}$/.test(normalizedEnd)
        || startMinutes < 600 || endMinutes > 1320 || endMinutes <= startMinutes) {
        return res.status(400).json({ pesan: 'Format tanggal atau waktu reservasi tidak valid.' });
    }
    if (!Number.isInteger(table) || table < 1 || !Number.isInteger(parsedGuests) || parsedGuests < 1 || parsedGuests > 20) {
        return res.status(400).json({ pesan: 'Nomor meja atau jumlah tamu tidak valid.' });
    }
    if (typeof notes !== 'string' || notes.length > 500) {
        return res.status(400).json({ pesan: 'Catatan maksimal 500 karakter.' });
    }

    req.booking = {
        name: name.trim(),
        date,
        time: safeTime,
        endTime: normalizedEnd,
        guestCount: parsedGuests,
        tableNumber: table,
        notes: notes.trim(),
    };
    return next();
}

function validateAvailabilityQuery(req, res, next) {
    const { date, start_time: startTime, end_time: endTime, guest_count: guestCount } = req.query;
    if (!date && !startTime && !endTime && !guestCount) return next();

    const dateIsValid = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date);
    const startIsValid = typeof startTime === 'string' && /^\d{2}:\d{2}$/.test(startTime);
    const endIsValid = typeof endTime === 'string' && /^\d{2}:\d{2}$/.test(endTime);
    const guests = Number(guestCount);
    const startMinutes = startIsValid ? Number(startTime.slice(0, 2)) * 60 + Number(startTime.slice(3)) : -1;
    const endMinutes = endIsValid ? Number(endTime.slice(0, 2)) * 60 + Number(endTime.slice(3)) : -1;

    if (!dateIsValid || !startIsValid || !endIsValid || !Number.isInteger(guests)
        || guests < 1 || guests > 20 || startMinutes < 600 || endMinutes > 1320
        || endMinutes <= startMinutes) {
        return res.status(400).json({ pesan: 'Filter ketersediaan tanggal, waktu, atau jumlah tamu tidak valid.' });
    }

    req.availability = { date, startTime, endTime, guestCount: guests };
    return next();
}

module.exports = {
    validateRegistration,
    validateLogin,
    validateBooking,
    validateAvailabilityQuery,
};
