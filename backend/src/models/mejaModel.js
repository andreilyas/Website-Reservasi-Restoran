// src/models/mejaModel.js

// Status: 0 (Kosong), 1 (Pending), 2 (Terisi)
let daftarMeja = Array.from({ length: 15 }, (_, i) => ({
    id_meja: i + 1,
    status_meja: 0 
}));

let daftarRiwayatReservasi = [];

module.exports = {
    daftarMeja,
    daftarRiwayatReservasi
};