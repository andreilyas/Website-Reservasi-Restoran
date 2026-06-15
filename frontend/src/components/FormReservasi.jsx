// src/components/FormReservasi.jsx
import { useState } from 'react';

export default function FormReservasi({ onReservasiSukses }) {
  const [namaPelanggan, setNamaPelanggan] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [idMeja, setIdMeja] = useState('');

  const tanganiSubmit = async (e) => {
    e.preventDefault(); // Mencegah halaman refresh saat tombol ditekan

    const dataKirim = {
      nama_pelanggan: namaPelanggan,
      tanggal_reservasi: tanggal,
      id_meja: parseInt(idMeja) // Pastikan ID dikirim sebagai angka, bukan teks
    };

    try {
      // Mengirim data ke Backend (persis seperti saat kita pakai Thunder Client/Postman)
      const respon = await fetch('http://localhost:5000/api/reservasi/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataKirim)
      });

      const hasil = await respon.json();

      if (respon.ok) {
        alert(hasil.pesan); // Muncul pop-up sukses
        setNamaPelanggan(''); // Kosongkan form
        setTanggal('');
        setIdMeja('');
        onReservasiSukses(); // Beritahu App.jsx untuk memperbarui warna meja
      } else {
        alert("Gagal: " + hasil.pesan); // Muncul pop-up error dari backend
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  return (
    <div className="kotak-form">
      <h3>Buat Reservasi</h3>
      <form onSubmit={tanganiSubmit}>
        <div className="input-group">
          <label>Nama Pelanggan</label>
          <input type="text" value={namaPelanggan} onChange={(e) => setNamaPelanggan(e.target.value)} required />
        </div>
        <div className="input-group">
          <label>Tanggal</label>
          <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required />
        </div>
        <div className="input-group">
          <label>Nomor Meja</label>
          <input type="number" min="1" max="15" value={idMeja} onChange={(e) => setIdMeja(e.target.value)} required />
        </div>
        <button type="submit" className="btn-hijau">Buat Reservasi</button>
      </form>
    </div>
  );
}