import { getTimeSlots, MAX_GUESTS } from '../utils/validation';

export default function BookingFilters({ form, errors, onChange, onStep, loading }) {
  return (
    <div className="filter-card">
      <div className="filter-card-heading">
        <div className="filter-icon">⌁</div>
        <div><strong>Atur preferensi reservasi</strong><span>Meja tersedia akan diperbarui otomatis</span></div>
      </div>
      <div className="filter-fields">
        <label className={`field ${errors.tanggal ? 'has-error' : ''}`}>
          <span>Tanggal</span>
          <input type="date" value={form.tanggal} onChange={(event) => onChange('tanggal', event.target.value)} />
          {errors.tanggal && <small>{errors.tanggal}</small>}
        </label>
        <label className={`field ${errors.waktu ? 'has-error' : ''}`}>
          <span>Jam kedatangan</span>
          <select value={form.waktu} onChange={(event) => onChange('waktu', event.target.value)}>
            {getTimeSlots().map((time) => <option key={time} value={time}>{time} WIB</option>)}
          </select>
          {errors.waktu && <small>{errors.waktu}</small>}
        </label>
        <label className={`field ${errors.jumlahTamu ? 'has-error' : ''}`}>
          <span>Jumlah tamu</span>
          <select value={form.jumlahTamu} onChange={(event) => onChange('jumlahTamu', event.target.value)}>
            {Array.from({ length: MAX_GUESTS }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} orang</option>)}
          </select>
          {errors.jumlahTamu && <small>{errors.jumlahTamu}</small>}
        </label>
        <button className="btn-primary filter-submit" onClick={onStep} disabled={loading}>
          {loading ? <><span className="spinner spinner-inline" /> Memuat...</> : <>Tampilkan meja <span>→</span></>}
        </button>
      </div>
    </div>
  );
}
