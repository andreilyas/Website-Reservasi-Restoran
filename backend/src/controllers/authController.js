// backend-reservasi/src/controllers/authController.js
const { daftarUser } = require('../models/userModel');

const login = (req, res) => {
    const { username, password } = req.body;
    const userDitemukan = daftarUser.find(
        (u) => u.username === username && u.password === password
    );

    if (!userDitemukan) {
        return res.status(401).json({ pesan: "Username atau password salah!" });
    }

    res.status(200).json({
        pesan: "Login berhasil!",
        data: {
            id_user: userDitemukan.id_user,
            username: userDitemukan.username,
            role: userDitemukan.role
        }
    });
};

// FITUR BARU: Registrasi akun Tamu
const register = (req, res) => {
    const { username, password } = req.body;

    // Validasi kosong
    if (!username || !password) {
        return res.status(400).json({ pesan: "Username dan password wajib diisi!" });
    }

    // Cek apakah username sudah ada yang memakai
    const userSudahAda = daftarUser.find(u => u.username === username);
    if (userSudahAda) {
        return res.status(400).json({ pesan: "Username sudah terdaftar, silakan gunakan yang lain." });
    }

    // Buat user baru dengan peran default 'tamu'
    const userBaru = {
        id_user: Date.now(), // Gunakan timestamp sebagai ID unik sementara
        username: username,
        password: password,
        role: "tamu"
    };

    // Masukkan ke array database sementara
    daftarUser.push(userBaru);

    res.status(201).json({
        pesan: "Registrasi berhasil! Silakan masuk menggunakan akun baru Anda."
    });
};

module.exports = { login, register };