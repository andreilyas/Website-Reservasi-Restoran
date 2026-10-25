export default function Navbar({ page, activeUser, onHome, onDashboard, onLogin, onLogout }) {
  return (
    <header className="navbar">
      <button className="navbar-brand" onClick={onHome} aria-label="RestoKalcer, kembali ke beranda">
        <span className="logo-mark">✦</span><span>Resto<span className="brand-accent">Kalcer</span></span>
      </button>
      <nav className="navbar-links" aria-label="Navigasi utama">
        <button className={page === 'landing' ? 'active' : ''} onClick={onHome}>Beranda</button>
        <button className={page === 'reservasi' || page === 'admin' ? 'active' : ''} onClick={onDashboard}>
          {activeUser?.role === 'admin' ? 'Dasbor Admin' : 'Reservasi'}
        </button>
      </nav>
      <div className="navbar-actions">
        {activeUser ? (
          <><span className="user-greeting">Hi, {activeUser.username}</span><button className="btn-outline" onClick={onLogout}>Keluar</button></>
        ) : <button className="btn-outline" onClick={onLogin}>Masuk <span>→</span></button>}
      </div>
    </header>
  );
}
