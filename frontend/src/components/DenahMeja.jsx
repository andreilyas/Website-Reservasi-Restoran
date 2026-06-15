// src/components/DenahMeja.jsx
import { useState } from 'react';
import { createPortal } from 'react-dom'; // 1. Tambahkan fitur Portal dari React

export default function DenahMeja({ daftarMeja, onStatusBerubah, role }) {
  const [modalBuka, setModalBuka] = useState(false);
  const [dataModal, setDataModal] = useState({ idMeja: null, statusSaatIni: null, detailInfo: null });

  const tentukanKelasWarna = (status) => {
    if (status === 0) return "status-kosong";
    if (status === 1) return "status-pending";
    if (status === 2) return "status-terisi";
    return "";
  };

  const tanganiKlikMeja = async (idMeja, statusSaatIni) => {
    if (role !== 'admin') return; 

    try {
      const respon = await fetch(`http://localhost:5000/api/reservasi/detail/${idMeja}`);
      const hasil = await respon.json();

      setDataModal({
        idMeja: idMeja,
        statusSaatIni: statusSaatIni,
        detailInfo: hasil.data
      });
      setModalBuka(true);

    } catch (error) {
      alert("Gagal mengambil detail meja dari server.");
    }
  };

  const eksekusiUbahStatus = async (statusBaru) => {
    try {
      const respon = await fetch('http://localhost:5000/api/reservasi/update-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_meja: dataModal.idMeja, status_baru: statusBaru })
      });

      const hasil = await respon.json();
      if (respon.ok) {
        alert(hasil.pesan);
        setModalBuka(false); 
        onStatusBerubah();   
      } else {
        alert(hasil.pesan);
      }
    } catch (error) {
      alert("Gagal memperbarui status.");
    }
  };

  return (
    <div className="kotak-denah">
      <h3>Denah Meja {role === 'admin' && <span style={{fontSize: '14px', color: '#e74c3c'}}> (Mode Admin)</span>}</h3>
      
      <div className="keterangan-warna">
        <span className="dot hijau"></span> Kosong
        <span className="dot kuning"></span> Pending
        <span className="dot merah"></span> Terisi
      </div>
      
      <div className="grid-meja">
        {daftarMeja.map((meja) => (
          <div 
            key={meja.id_meja} 
            className={`meja ${tentukanKelasWarna(meja.status_meja)}`}
            onClick={() => tanganiKlikMeja(meja.id_meja, meja.status_meja)}
            title={role === 'admin' ? "Klik untuk lihat detail & ubah" : `Meja ${meja.id_meja}`}
            style={{ cursor: role === 'admin' ? 'pointer' : 'default' }} 
          >
            {meja.id_meja}
          </div>
        ))}
      </div>

      {/* 2. Gunakan createPortal untuk "melempar" Modal keluar dari kotak denah */}
      {modalBuka && createPortal(
        <div className="modal-overlay fade-in">
          <div className="modal-content">
            <button className="btn-tutup-modal" onClick={() => setModalBuka(false)}>✕</button>
            
            <h2 style={{ marginBottom: '15px', color: 'var(--primer)' }}>Meja Nomor {dataModal.idMeja}</h2>
            
            {dataModal.statusSaatIni !== 0 && dataModal.detailInfo ? (
              <div className="modal-detail-box">
                <p><strong>Nama Pemesan:</strong> {dataModal.detailInfo.nama_pelanggan}</p>
                <p><strong>Tanggal:</strong> {dataModal.detailInfo.tanggal_reservasi}</p>
                <p><strong>Status Terakhir:</strong> {dataModal.detailInfo.status_reservasi}</p>
              </div>
            ) : (
              <div className="modal-detail-box" style={{ background: '#f1f5f9' }}>
                <p>Belum ada data reservasi (Meja Kosong).</p>
              </div>
            )}

            <p style={{ marginTop: '20px', marginBottom: '10px', fontWeight: 'bold' }}>Ubah Status Meja Menjadi:</p>
            
            <div className="modal-actions">
              <button className="btn-modal hijau" onClick={() => eksekusiUbahStatus(0)}>
                Kosongkan (Hijau)
              </button>
              <button className="btn-modal merah" onClick={() => eksekusiUbahStatus(2)}>
                Set Terisi (Merah)
              </button>
            </div>
          </div>
        </div>,
        document.body // <- Ini yang membuat Modal menempel langsung ke layar utama (body)
      )}
    </div>
  );
}