export default function Footer({ onHome, onReserve }) {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand"><button className="footer-logo" onClick={onHome}>✦ Resto<span>Kalcer</span></button><p>Pengalaman kuliner terbaik berawal dari meja yang nyaman dan momen yang bermakna.</p><div className="footer-hours"><span className="status-live" /> Buka setiap hari<br /><strong>10.00 — 22.00 WIB</strong></div></div>
        <div><h3>Jelajahi</h3><button onClick={onHome}>Beranda</button><button onClick={onReserve}>Pesan meja</button><button onClick={onReserve}>Cek ketersediaan</button></div>
        <div><h3>Hubungi kami</h3><p>Jl. Boulevard Raya, Blok M No. 15<br />Jakarta Selatan</p><p>(021) 555-1234<br />info@restokalcer.com</p></div>
        <div><h3>Ikuti cerita kami</h3><p>Dapatkan info promo dan menu terbaru.</p><div className="social-links"><button aria-label="Instagram">ig</button><button aria-label="Facebook">f</button><button aria-label="Twitter">𝕏</button></div></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} RestoKalcer</span><span>Made for good moments ✦</span></div>
    </footer>
  );
}
