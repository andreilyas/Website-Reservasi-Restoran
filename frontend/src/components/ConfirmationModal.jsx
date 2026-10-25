import { useEffect } from 'react';

export default function ConfirmationModal({ reservation, form, table, onClose }) {
  useEffect(() => {
    const handleKey = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="confirmation-title">
        <div className="success-orbit"><span>✓</span></div>
        <span className="eyebrow">Reservation confirmed</span>
        <h2 id="confirmation-title">Mejamu sudah siap.</h2>
        <p>Terima kasih, {form.namaPelanggan}. Kami menantikan kedatanganmu di RestoKalcer.</p>
        <div className="confirmation-code"><small>KODE RESERVASI</small><strong>{reservation?.id_reservasi || 'MENUNGGU KONFIRMASI'}</strong></div>
        <div className="confirmation-details">
          <span>📅 {form.tanggal}</span><span>◷ {form.waktu} WIB</span>
          <span>▦ Meja {table?.id_meja || reservation?.id_meja}</span>
        </div>
        <button className="btn-primary submit-button" onClick={onClose}>Selesai <span>→</span></button>
      </div>
    </div>
  );
}
