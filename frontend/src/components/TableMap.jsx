const statusMap = {
  0: { label: 'Tersedia', className: 'available' },
  1: { label: 'Pending', className: 'pending' },
  2: { label: 'Terisi', className: 'occupied' },
};

export default function TableMap({ tables, loading, error, selectedId, onSelect, interactive = false }) {
  if (loading) return <div className="map-card map-state"><span className="spinner" /> Memuat ketersediaan meja...</div>;
  if (error) return <div className="map-card map-state error-state"><strong>Ketersediaan belum dapat dimuat.</strong><span>{error}</span></div>;
  if (!tables.length) return <div className="map-card map-state">Belum ada meja yang terdaftar.</div>;

  return (
    <div className="map-card">
      <div className="map-toolbar">
        <div className="legend">
          <span><i className="legend-dot available" /> Tersedia</span>
          <span><i className="legend-dot pending" /> Menunggu</span>
          <span><i className="legend-dot occupied" /> Terisi</span>
        </div>
        <span className="map-hint">{interactive ? 'Klik meja hijau untuk memilih' : 'Mode operasional'}</span>
      </div>
      <div className="map-stage">
        <div className="map-window">JENDELA</div>
        <div className="map-bar"><span>AREA MAKAN</span><span>🍽️</span><span>AREA MAKAN</span></div>
        <div className="table-grid">
          {tables.map((table) => {
            const status = statusMap[table.status_meja] || statusMap[2];
            const isSelected = selectedId === table.id_meja;
            const disabled = !interactive || table.status_meja !== 0;
            return (
              <button
                key={table.id_meja}
                className={`table-node ${status.className} ${isSelected ? 'selected' : ''}`}
                onClick={() => !disabled && onSelect(table.id_meja)}
                disabled={disabled}
                aria-label={`Meja ${table.id_meja}, ${status.label}`}
                title={`${status.label}${interactive && !disabled ? ' — pilih meja' : ''}`}
              >
                <span className="table-number">{String(table.id_meja).padStart(2, '0')}</span>
                <span className="table-label">{status.label}</span>
                {isSelected && <span className="selected-check">✓</span>}
              </button>
            );
          })}
        </div>
        <div className="map-entrance"><span>↕</span> PINTU MASUK</div>
      </div>
      <div className="map-note"><span>✦</span> Pilih meja hijau untuk melanjutkan. Status meja dapat berubah secara real-time.</div>
    </div>
  );
}
