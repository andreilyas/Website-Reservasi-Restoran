// frontend-reservasi/src/components/Login.jsx
import React, { useState } from 'react';

export default function Login({ onLoginSukses, setHalaman }) {
  const [modeLogin, setModeLogin] = useState(true); // true = Form Masuk, false = Form Daftar
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const tanganiSubmit = async (e) => {
    e.preventDefault();
    
    // Tentukan URL tujuan berdasarkan mode form yang aktif
    const urlTujuan = modeLogin 
      ? 'http://localhost:5000/api/auth/login' 
      : 'http://localhost:5000/api/auth/register';

    try {
      const respon = await fetch(urlTujuan, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const hasil = await respon.json();

      if (respon.ok) {
        if (modeLogin) {
          // Jika berhasil Login, kirim data ke App.jsx
          onLoginSukses(hasil.data);
        } else {
          // Jika berhasil Daftar, munculkan alert sukses & arahkan balik ke form Login
          alert(hasil.pesan);
          setModeLogin(true); // Ubah wujud kembali ke form login
          setPassword('');    // Kosongkan kolom password demi keamanan
        }
      } else {
        alert(hasil.pesan); // Tampilkan pesan error dari backend (misal: username sudah terdaftar)
      }
    } catch (error) {
      alert("Terjadi kesalahan koneksi server.");
    }
  };

  // Fungsi untuk beralih mode dan mengosongkan input
  const gantiMode = () => {
    setModeLogin(!modeLogin);
    setUsername('');
    setPassword('');
  };

  return (
    <div className="login-container fade-in">
      {/* Menggunakan kelas kotak-form agar desain efek kacanya (Glassmorphism) terbawa */}
      <div className="kotak-form login-box" style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
        
        <h2 style={{ marginBottom: '5px', color: 'var(--primer)' }}>
          {modeLogin ? 'Masuk ke Akun' : 'Buat Akun Baru'}
        </h2>
        <p style={{ marginBottom: '25px', color: 'var(--teks-sekunder)', fontSize: '14px' }}>
          {modeLogin 
            ? 'Silakan masukkan username dan password Anda.' 
            : 'Daftarkan diri Anda untuk mulai reservasi meja.'}
        </p>

        <form onSubmit={tanganiSubmit}>
          <div className="input-group" style={{ textAlign: 'left', marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              placeholder="Ketik username Anda"
            />
          </div>
          
          <div className="input-group" style={{ textAlign: 'left', marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="Ketik password Anda"
            />
          </div>
          
          <button type="submit" className="btn-utama" style={{ width: '100%', borderRadius: '12px' }}>
            {modeLogin ? 'Masuk' : 'Daftar Sekarang'}
          </button>
        </form>

        {/* Teks Toggle untuk ganti mode */}
        <div style={{ marginTop: '20px', fontSize: '14px', color: 'var(--teks-sekunder)' }}>
          {modeLogin ? "Belum punya akun? " : "Sudah punya akun? "}
          <span 
            onClick={gantiMode} 
            style={{ color: 'var(--primer)', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {modeLogin ? 'Daftar di sini' : 'Masuk di sini'}
          </span>
        </div>

        <hr style={{ borderTop: '1px dashed #cbd5e1', borderBottom: 'none', margin: '20px 0' }} />

        <button className="btn-kembali" onClick={() => setHalaman('landing')} style={{ width: '100%', justifyContent: 'center', marginBottom: '0' }}>
          &larr; Kembali ke Beranda
        </button>
        
      </div>
    </div>
  );
}