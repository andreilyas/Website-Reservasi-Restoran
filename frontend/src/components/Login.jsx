import { useState } from 'react';
import { authenticate } from '../services/api';

export default function Login({ onLoginSuccess, onBack }) {
  const [loginMode, setLoginMode] = useState(true);
  const [form, setForm] = useState({ username: '', password: '' });
  const [state, setState] = useState({ loading: false, error: '', success: '' });

  const submit = async (event) => {
    event.preventDefault();
    if (!form.username.trim() || !form.password) {
      setState({ loading: false, error: 'Username dan password wajib diisi.', success: '' });
      return;
    }
    setState({ loading: true, error: '', success: '' });
    try {
      const result = await authenticate(form, loginMode ? 'login' : 'register');
      if (loginMode) onLoginSuccess(result.data, result.token);
      else {
        setState({ loading: false, error: '', success: result.pesan || 'Akun berhasil dibuat.' });
        setLoginMode(true);
        setForm({ username: form.username, password: '' });
      }
    } catch (error) {
      setState({ loading: false, error: error.message, success: '' });
    }
  };

  return (
    <section className="auth-page fade-in">
      <div className="auth-visual"><span className="eyebrow">Selamat datang di RestoKalcer</span><h1>Rasa yang selalu punya <em>cerita.</em></h1><p>Masuk untuk menyimpan reservasi dan membuat kunjungan berikutnya lebih mudah.</p><div className="auth-quote">“Tempat yang tepat, dengan orang yang tepat.”</div></div>
      <div className="auth-card">
        <button className="back-link" onClick={onBack}>← Kembali</button>
        <div className="auth-icon">✦</div>
        <span className="eyebrow">{loginMode ? 'Member access' : 'Join the table'}</span>
        <h2>{loginMode ? 'Masuk ke akunmu' : 'Buat akun baru'}</h2>
        <p>{loginMode ? 'Lanjutkan perjalanan kulinermu bersama kami.' : 'Daftar dan mulai reservasi meja favoritmu.'}</p>
        {state.success && <div className="success-message">{state.success}</div>}
        {state.error && <div className="form-error form-error-box">{state.error}</div>}
        <form onSubmit={submit} noValidate>
          <label className="field"><span>Username</span><input autoComplete="username" value={form.username} placeholder="Masukkan username" onChange={(event) => setForm({ ...form, username: event.target.value })} /></label>
          <label className="field"><span>Password</span><input type="password" autoComplete={loginMode ? 'current-password' : 'new-password'} value={form.password} placeholder="Masukkan password" onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
          <button className="btn-primary submit-button" disabled={state.loading}>{state.loading ? <><span className="spinner spinner-light" /> Memproses...</> : loginMode ? 'Masuk ke akun →' : 'Daftar sekarang →'}</button>
        </form>
        <p className="auth-switch">{loginMode ? 'Belum punya akun?' : 'Sudah punya akun?'} <button onClick={() => { setLoginMode(!loginMode); setState({ loading: false, error: '', success: '' }); }}> {loginMode ? 'Daftar di sini' : 'Masuk di sini'}</button></p>
      </div>
    </section>
  );
}
