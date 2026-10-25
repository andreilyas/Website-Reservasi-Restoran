export default function ReservationForm({
  form, errors, state, selectedTable, activeUser, onChange, onSubmit, onReset,
}) {
  return (
    <aside className="reservation-card">
      <div className="card-topline"><span className="eyebrow">Detail reservasi</span><span className="secure-pill">✦ Aman</span></div>
      <h2>Lengkapi detailmu</h2>
      <p className="card-description">Kami butuh beberapa informasi agar kunjunganmu sempurna.</p>
      <form onSubmit={onSubmit} noValidate>
        <label className={`field ${errors.namaPelanggan ? 'has-error' : ''}`}>
          <span>Nama lengkap</span>
          <input type="text" value={form.namaPelanggan} placeholder="Contoh: Andi Pratama" maxLength="100" onChange={(event) => onChange('namaPelanggan', event.target.value)} />
          {errors.namaPelanggan && <small>{errors.namaPelanggan}</small>}
        </label>
        <div className="form-row">
          <label className="field"><span>Jam</span><input value={`${form.waktu} WIB`} readOnly /></label>
          <label className="field"><span>Jumlah tamu</span><input value={`${form.jumlahTamu} orang`} readOnly /></label>
        </div>
        <label className="field">
          <span>Catatan <em>(opsional)</em></span>
          <textarea value={form.catatan} maxLength="500" placeholder="Ada permintaan khusus?" onChange={(event) => onChange('catatan', event.target.value)} rows="3" />
        </label>
        <div className={`selected-summary ${errors.idMeja ? 'has-error' : ''}`}>
          <span className="summary-icon">▦</span>
          <div><small>Meja pilihanmu</small><strong>{selectedTable ? `Meja ${String(selectedTable.id_meja).padStart(2, '0')}` : 'Belum dipilih'}</strong></div>
          <span className="summary-status">{selectedTable ? 'Tersedia' : 'Pilih di denah'}</span>
        </div>
        {errors.idMeja && <div className="form-error">{errors.idMeja}</div>}
        {state.error && <div className="form-error form-error-box">{state.error}</div>}
        <button className="btn-primary submit-button" type="submit" disabled={state.submitting}>
          {state.submitting ? <><span className="spinner spinner-light" /> Memproses...</> : <>Konfirmasi reservasi <span>→</span></>}
        </button>
        <button className="text-button" type="button" onClick={onReset}>Reset formulir</button>
        {!activeUser && <p className="guest-note">Kamu dapat melanjutkan sebagai tamu. Login akan tersedia untuk riwayat reservasi.</p>}
      </form>
    </aside>
  );
}
