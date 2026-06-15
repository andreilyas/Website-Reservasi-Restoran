// src/components/Navbar.jsx
export default function Navbar({ halaman, userAktif, onAksiNav, onLogout }) { 
  return (
    <nav className="navbar">
      {/* KIRI: Logo */}
      <div className="navbar-brand" style={{ cursor: 'default' }}>
        <span className="logo-icon">🍽️</span> 
        <span className="teks-logo">RestoKalcer</span>
      </div>
      
      {/* TENGAH: Navigasi Utama */}
      <ul className="navbar-links">
        <li 
          className={halaman === 'landing' ? 'aktif' : ''} 
          style={{ cursor: 'default' }} 
        >
          Beranda
        </li>
        <li 
          className={(halaman === 'reservasi' || halaman === 'admin') ? 'aktif' : ''}
          style={{ cursor: 'default' }} 
        >
          {userAktif && userAktif.role === 'admin' ? 'Dasbor Admin' : 'Reservasi'}
        </li>
      </ul>

      {/* KANAN: Tombol Aksi */}
      <div className="navbar-actions">
        {userAktif ? (
          /* JIKA SUDAH LOGIN */
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            
            {/* LOGIKA BARU: Teks sapaan HANYA dirender jika pengguna sedang berada di halaman dasbor */}
            {(halaman === 'reservasi' || halaman === 'admin') && (
              <span style={{ fontWeight: '600', color: 'var(--teks-sekunder)', fontSize: '14px' }}>
                👋 Hai, {userAktif.username}
              </span>
            )}
            
            <button className="btn-login" onClick={onLogout}>
              Keluar
            </button>
          </div>
        ) : (
          /* JIKA BELUM LOGIN */
          <button className="btn-login" onClick={onAksiNav}>
            Masuk
          </button>
        )}
      </div>
    </nav>
  );
}