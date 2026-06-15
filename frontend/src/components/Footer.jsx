// src/components/Footer.jsx
import React from 'react';

export default function Footer({ setHalaman }) {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* Kolom 1: Brand & Jam Operasional */}
        <div className="footer-col">
          <h2 className="footer-logo">🍽️ RestoKalcer</h2>
          <p className="footer-deskripsi">
            Menyajikan hidangan berkualitas tinggi dengan cita rasa otentik. Pengalaman kuliner terbaik berawal dari meja yang nyaman.
          </p>
          <div className="footer-jam-kerja">
            <strong>Jam Operasional:</strong>
            <p>Setiap Hari: 10.00 - 22.00 WIB</p>
          </div>
        </div>

        {/* Kolom 2: Tautan Navigasi */}
        <div className="footer-col">
          <h3>Navigasi</h3>
          <ul className="footer-links">
            <li onClick={() => setHalaman('landing')}>Beranda</li>
            <li onClick={() => setHalaman('reservasi')}>Pesan Meja (Reservasi)</li>
            <li>Menu Spesial</li>
            <li>Tentang Kami</li>
          </ul>
        </div>

        {/* Kolom 3: Informasi Kontak */}
        <div className="footer-col">
          <h3>Hubungi Kami</h3>
          <ul className="footer-kontak">
            <li>📍 Jl. Boulevard Raya, Blok M No. 15, Jakarta Selatan</li>
            <li>📞 (021) 555-1234</li>
            <li>✉️ info@restokalcer.com</li>
          </ul>
        </div>

        {/* Kolom 4: Media Sosial */}
        <div className="footer-col">
          <h3>Ikuti Kami</h3>
          <p className="footer-sosmed-teks">Dapatkan info promo dan menu terbaru melalui media sosial kami:</p>
          <div className="footer-sosmed-icons">
            <span className="sosmed-icon" title="Instagram">📸</span>
            <span className="sosmed-icon" title="Facebook">🌐</span>
            <span className="sosmed-icon" title="Twitter">🐦</span>
          </div>
        </div>

      </div>

      {/* Bagian Paling Bawah: Copyright & Legalitas */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} RestoKalcer. Seluruh Hak Cipta Dilindungi.</p>
        <div className="footer-legal">
          <span>Kebijakan Privasi</span>
          <span>Syarat & Ketentuan</span>
        </div>
      </div>
    </footer>
  );
}