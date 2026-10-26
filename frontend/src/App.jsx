import { useCallback, useEffect, useMemo, useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './components/Login';
import ReservationWorkspace from './components/ReservationWorkspace';
import AdminDashboard from './components/AdminDashboard';
import Toast from './components/Toast';
import { getTables } from './services/api';
import { useBooking } from './hooks/useBooking';
import heroImage from './assets/hero.png';
import './App.css';

function App() {
  const [tables, setTables] = useState([]);
  const [page, setPage] = useState('landing');
  const [activeUser, setActiveUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('restokalcer_user')) || null;
    } catch {
      return null;
    }
  });
  const [tableState, setTableState] = useState({ loading: true, error: '' });
  const [toast, setToast] = useState(null);

  const loadTables = useCallback(async (filters = {}) => {
    setTableState({ loading: true, error: '' });
    try {
      const response = await getTables(filters);
      const nextTables = response.data || [];
      setTables(nextTables);
      setTableState({ loading: false, error: '' });
      return nextTables;
    } catch (error) {
      setTableState({ loading: false, error: error.message });
      return [];
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadTables();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadTables]);

  const booking = useBooking({
    tables,
    onSuccess: async (reservation) => {
      await loadTables();
      setToast({ type: 'success', message: reservation?.pesan || 'Reservasi berhasil dibuat.' });
    },
  });

  const openDashboard = () => {
    if (!activeUser) {
      setPage('login');
      return;
    }
    setPage(activeUser.role === 'admin' ? 'admin' : 'reservasi');
  };

  const handleLogin = (user, token) => {
    setActiveUser(user);
    if (token) localStorage.setItem('restokalcer_token', token);
    localStorage.setItem('restokalcer_user', JSON.stringify(user));
    setToast({ type: 'success', message: `Selamat datang, ${user.username}.` });
    setPage(user.role === 'admin' ? 'admin' : 'reservasi');
  };

  const handleLogout = () => {
    setActiveUser(null);
    localStorage.removeItem('restokalcer_user');
    localStorage.removeItem('restokalcer_token');
    setPage('landing');
    booking.reset();
  };

  const selectedTable = useMemo(
    () => tables.find((table) => table.id_meja === booking.form.idMeja),
    [booking.form.idMeja, tables],
  );

  return (
    <div className="app-container">
      <Navbar
        page={page}
        activeUser={activeUser}
        onHome={() => setPage('landing')}
        onDashboard={openDashboard}
        onLogin={() => setPage('login')}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {page === 'landing' && (
          <section className="landing-page fade-in">
            <div className="hero-glow hero-glow-one" />
            <div className="hero-glow hero-glow-two" />
            <div className="hero-content">
              <span className="eyebrow"><span className="eyebrow-dot" /> Reservasi lebih mudah</span>
              <h1>Meja terbaik untuk <em>momen terbaik.</em></h1>
              <p>
                Pilih waktu, temukan meja favoritmu, dan nikmati pengalaman kuliner
                tanpa antre di RestoKalcer.
              </p>
              <div className="hero-actions">
                <button className="btn-primary btn-large" onClick={openDashboard}>
                  Mulai reservasi <span aria-hidden="true">→</span>
                </button>
                <button className="btn-ghost btn-large" onClick={openDashboard}>
                  Lihat cara kerja
                </button>
              </div>
              <div className="hero-proof">
                <div className="avatar-stack" aria-hidden="true">
                  <span>A</span><span>B</span><span>C</span><span>+</span>
                </div>
                <div><strong>500+</strong><small>momen bahagia bulan ini</small></div>
              </div>
            </div>
            <div className="hero-card" aria-label="Informasi operasional restoran">
              <div className="hero-card-image">
                <img src={heroImage} alt="Suasana meja restoran RestoKalcer" />
                <span className="floating-badge">✦ Favorit pelanggan</span>
              </div>
              <div className="hero-card-body">
                <div><span className="status-live" /> Buka hari ini</div>
                <strong>10.00 — 22.00 WIB</strong>
                <span>Jl. Boulevard Raya, Jakarta Selatan</span>
              </div>
            </div>
          </section>
        )}

        {page === 'login' && (
          <Login onLoginSuccess={handleLogin} onBack={() => setPage('landing')} />
        )}

        {page === 'reservasi' && activeUser && (
          <ReservationWorkspace
            booking={booking}
            tables={tables}
            tableState={tableState}
            selectedTable={selectedTable}
            onReload={loadTables}
            onBack={() => setPage('landing')}
            activeUser={activeUser}
          />
        )}

        {page === 'admin' && (
          <AdminDashboard
            tables={tables}
            tableState={tableState}
            onReload={loadTables}
            onBack={() => setPage('landing')}
          />
        )}
      </main>

      <Footer onHome={() => setPage('landing')} onReserve={openDashboard} />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}

export default App;
