// src/App.jsx
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FormReservasi from './components/FormReservasi';
import DenahMeja from './components/DenahMeja';
import Login from './components/Login'; // 1. TAMBAHKAN IMPORT COMPONENT LOGIN
import './App.css';

function App() {
  const [daftarMeja, setDaftarMeja] = useState([]);
  const [halaman, setHalaman] = useState('landing'); 
  const [userAktif, setUserAktif] = useState(null); // 2. STATE UNTUK MENYIMPAN DATA USER YANG LOGIN

  const ambilDataMeja = async () => {
    try {
      const respon = await fetch('http://localhost:5000/api/reservasi/meja');
      const hasil = await respon.json();
      setDaftarMeja(hasil.data);
    } catch (error) {
      console.error("Gagal mengambil data meja:", error);
    }
  };

  useEffect(() => {
    ambilDataMeja();
  }, []);

  // 3. FUNGSI LOGIKA KETIKA TOMBOL MASUK / DASBOR DI NAVBAR DIKLIK
  const tanganiAksiNav = () => {
    if (userAktif) {
      // Jika sudah login, tombol akan mengarahkan ke halaman sesuai hak aksesnya
      setHalaman(userAktif.role === 'admin' ? 'admin' : 'reservasi');
    } else {
      // Jika belum login, arahkan ke halaman form login
      setHalaman('login');
    }
  };

  // 4. FUNGSI LOGIKA SAAT PROSES LOGIN DI BACKEND BERHASIL
  const tanganiLoginSukses = (dataUser) => {
    setUserAktif(dataUser);
    alert(`Selamat datang kembali, ${dataUser.username}!`);
    
    // Arahkan ke dashboard yang tepat berdasarkan role pengguna
    if (dataUser.role === 'admin') {
      setHalaman('admin');
    } else {
      setHalaman('reservasi');
    }
  };

  // 5. FUNGSI LOGIKA UNTUK LOGOUT
  const tanganiLogout = () => {
    setUserAktif(null);
    setHalaman('landing');
  };

  return (
    <div className="app-container">
      {/* Kirim data user dan fungsi kontrol ke komponen Navbar */}
      <Navbar 
        halaman={halaman} 
        userAktif={userAktif} 
        onAksiNav={tanganiAksiNav} 
        onLogout={tanganiLogout} 
      />

      <main className="main-content">
        
        {/* --- HALAMAN 1: LANDING PAGE --- */}
        {halaman === 'landing' && (
          <div className="landing-page fade-in">
            <div className="hero-teks">
              <h1>Rasakan Pengalaman Kuliner Terbaik</h1>
              <p>Pesan mejamu sekarang dan nikmati hidangan spesial tanpa perlu mengantre panjang. Mudah, cepat, dan nyaman.</p>
              <button className="btn-utama" onClick={tanganiAksiNav}>
                Mulai Reservasi Sekarang
              </button>
            </div>
          </div>
        )}

        {/* --- HALAMAN 2: LOGIN --- */}
        {halaman === 'login' && (
          <Login onLoginSukses={tanganiLoginSukses} setHalaman={setHalaman} />
        )}

        {/* --- HALAMAN 3: DASBOR TAMU / RESERVASI --- */}
        {halaman === 'reservasi' && (
          <div className="reservasi-page fade-in">
            <button className="btn-kembali" onClick={tanganiLogout}>
              &larr; Kembali ke Beranda
            </button>
            <h2 className="judul-halaman">Sistem Reservasi Meja</h2>
            <div className="dashboard">
              <div className="kiri">
                <FormReservasi onReservasiSukses={ambilDataMeja} />
              </div>
              <div className="kanan">
                {/* Kunci akses dengan mengirimkan role 'tamu' agar tidak bisa modifikasi meja */}
                <DenahMeja daftarMeja={daftarMeja} role="tamu" />
              </div>
            </div>
          </div>
        )}

        {/* --- HALAMAN 4: DASBOR ADMIN / RESEPSIONIS --- */}
        {halaman === 'admin' && (
          <div className="reservasi-page fade-in">
            <button className="btn-kembali" onClick={tanganiLogout}>
              &larr; Kembali ke Beranda
            </button>
            <h2 className="judul-halaman">Dasbor Admin / Resepsionis</h2>
            <p style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--teks-sekunder)' }}>
              Mode Pengelolaan Aktif: Klik pada salah satu kotak meja di bawah ini untuk memperbarui status ketersediaan.
            </p>
            <div className="dashboard" style={{ justifyContent: 'center' }}>
              <div className="kanan" style={{ flex: 'none', width: '85%' }}>
                {/* Berikan role 'admin' dan fungsi update status meja */}
                <DenahMeja 
                  daftarMeja={daftarMeja} 
                  onStatusBerubah={ambilDataMeja} 
                  role="admin" 
                />
              </div>
            </div>
          </div>
        )}

      </main>

      <Footer setHalaman={setHalaman} />
    </div>
  );
}

export default App;