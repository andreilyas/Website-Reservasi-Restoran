// src/controllers/reservasiController.js
const { daftarMeja, daftarRiwayatReservasi } = require('../models/mejaModel');

// Fitur 1: Melihat ketersediaan meja
const cekKetersediaanMeja = (req, res) => {
    res.status(200).json({
        pesan: "Berhasil mengambil data meja",
        data: daftarMeja
    });
};

// Fitur 2: Membuat reservasi baru (Booking Meja - Untuk Tamu)
const buatReservasi = (req, res) => {
    const { nama_pelanggan, tanggal_reservasi, id_meja } = req.body;

    const indeksMeja = daftarMeja.findIndex(meja => meja.id_meja === id_meja);

    if (indeksMeja === -1) {
        return res.status(404).json({ pesan: "Meja tidak ditemukan!" });
    }

    if (daftarMeja[indeksMeja].status_meja !== 0) {
        return res.status(400).json({ pesan: "Maaf, meja ini sudah dipesan atau sedang terisi." });
    }

    daftarMeja[indeksMeja].status_meja = 1;

    const reservasiBaru = {
        id_reservasi: Date.now(),
        nama_pelanggan,
        tanggal_reservasi,
        id_meja,
        status_reservasi: "Pending"
    };
    daftarRiwayatReservasi.push(reservasiBaru);

    res.status(201).json({
        pesan: "Reservasi berhasil dibuat!",
        data: reservasiBaru
    });
};

// Fitur 3: Mengubah status meja (HANYA UNTUK ADMIN) <-- INI YANG SEBELUMNYA HILANG
const ubahStatusMeja = (req, res) => {
    const { id_meja, status_baru } = req.body; 

    const indeksMeja = daftarMeja.findIndex(meja => meja.id_meja === parseInt(id_meja));

    if (indeksMeja === -1) {
        return res.status(404).json({ pesan: "Meja tidak ditemukan!" });
    }

    // Ubah status meja di database
    daftarMeja[indeksMeja].status_meja = parseInt(status_baru);

    res.status(200).json({
        pesan: `Status meja nomor ${id_meja} berhasil diperbarui!`,
        data: daftarMeja[indeksMeja]
    });
};

// Fitur 4: Mendapatkan detail reservasi untuk sebuah meja (tambahan, bisa dipakai untuk fitur riwayat reservasi)
const getDetailReservasi = (req, res) => {
    // Ambil nomor meja dari URL
    const id_meja = parseInt(req.params.id_meja);
    
    // Cari semua histori reservasi untuk meja ini
    const reservasiMejaIni = daftarRiwayatReservasi.filter(r => r.id_meja === id_meja);
    
    // Ambil data yang paling terakhir dipesan (paling ujung di array)
    const reservasiTerbaru = reservasiMejaIni[reservasiMejaIni.length - 1];

    if (reservasiTerbaru) {
        res.status(200).json({ data: reservasiTerbaru });
    } else {
        // Jika belum pernah ada yang pesan meja ini
        res.status(200).json({ data: null });
    }
};

// PASTIKAN KETIGA FUNGSI INI DI-EXPORT
module.exports = {
    cekKetersediaanMeja,
    buatReservasi,
    ubahStatusMeja,
    getDetailReservasi
};