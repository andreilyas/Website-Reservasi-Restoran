import { useState } from 'react';
import TableMap from './TableMap';
import { getReservationDetail, updateTableStatus } from '../services/api';

export default function AdminDashboard({ tables, tableState, onReload, onBack }) {
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const openTable = async (id) => {
    setError('');
    try {
      const detail = await getReservationDetail(id);
      setModal({ id, detail: detail.data });
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const updateStatus = async (status) => {
    if (!modal) return;
    setLoading(true);
    try {
      await updateTableStatus(modal.id, status);
      setModal(null);
      await onReload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="workspace-page fade-in">
      <div className="page-heading">
        <button className="back-link" onClick={onBack}>← Kembali ke beranda</button>
        <div className="heading-row"><div><span className="eyebrow">Operations dashboard</span><h1>Kontrol meja hari ini.</h1><p>Pantau status meja dan bantu pelanggan dengan cepat.</p></div><div className="admin-kpi"><strong>{tables.filter((table) => table.status_meja === 0).length}</strong><span>meja tersedia</span></div></div>
      </div>
      {error && <div className="form-error form-error-box">{error}</div>}
      <div className="admin-map"><TableMap tables={tables} loading={tableState.loading} error={tableState.error} interactive={false} /><div className="admin-click-layer">{tables.map((table) => <button key={table.id_meja} aria-label={`Detail meja ${table.id_meja}`} onClick={() => openTable(table.id_meja)} />)}</div></div>
      {modal && <div className="modal-overlay" role="presentation"><div className="confirmation-modal admin-modal" role="dialog" aria-modal="true"><button className="modal-close" onClick={() => setModal(null)} aria-label="Tutup">×</button><span className="eyebrow">Meja {modal.id}</span><h2>Detail operasional</h2>{modal.detail ? <div className="modal-detail-box"><p><b>Nama:</b> {modal.detail.nama_pelanggan}</p><p><b>Tanggal:</b> {modal.detail.tanggal_reservasi}</p><p><b>Status:</b> {modal.detail.status_reservasi}</p></div> : <p className="empty-copy">Belum ada reservasi pada meja ini.</p>}<div className="modal-actions"><button className="btn-success" disabled={loading} onClick={() => updateStatus(0)}>Kosongkan</button><button className="btn-danger" disabled={loading} onClick={() => updateStatus(2)}>Set terisi</button></div></div></div>}
    </section>
  );
}
