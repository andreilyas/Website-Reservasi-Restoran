# Product Requirements Document

## RestoKalcer — Portfolio MVP

**Versi:** 2.0  
**Status:** Implementation scope  
**Tujuan:** Membuat showcase full-stack yang terlihat profesional, dapat didemokan end-to-end, dan mudah dideploy tanpa kompleksitas produk startup.

---

## 1. Ringkasan Produk

RestoKalcer adalah website portfolio reservasi meja restoran. Pengunjung dapat melihat landing page, login sebagai customer, memilih tanggal/jam/jumlah tamu, memilih meja tersedia, dan mendapatkan konfirmasi reservasi. Admin dapat login untuk melihat denah meja dan mengubah status meja.

Produk ini **bukan** sistem operasional restoran production-scale. Nilai utamanya adalah demonstrasi:

- React component-driven UI.
- REST API Node.js/Express.
- PostgreSQL persistence.
- bcrypt password hashing.
- JWT authentication.
- Role-based access control.
- Validasi server-side.
- Pencegahan double booking.
- Responsive UI dan error/loading state.

---

## 2. Sasaran Portfolio

### Wajib

1. Demo dapat dijalankan lokal dan dideploy.
2. Alur utama berjalan:

```text
Landing
→ Login/Register
→ Pilih tanggal, jam, jumlah tamu
→ Pilih meja
→ Isi detail
→ Konfirmasi reservasi
```

3. Admin dapat:

```text
Login admin
→ Melihat status meja
→ Membuka detail meja
→ Mengubah status meja
```

4. Data user, meja, dan reservasi tersimpan di PostgreSQL.
5. Endpoint privat terlindungi JWT dan RBAC.
6. Test inti lulus.
7. README menjelaskan cara menjalankan dan men-deploy proyek.

### Tidak termasuk MVP

- Pembayaran atau deposit.
- Email, WhatsApp, atau SMS notification.
- Multi-cabang.
- Loyalty atau membership.
- Menu dan ordering.
- Reporting bisnis.
- Role receptionist terpisah secara UI.
- Forgot password.
- Audit log kompleks.
- Queue/background worker.
- Realtime websocket.
- Observability enterprise.

Fitur tersebut boleh menjadi ide pengembangan berikutnya, tetapi tidak boleh menghambat deployment portfolio.

---

## 3. Persona dan Use Case

### Customer

- Membuat akun atau login.
- Melihat availability meja.
- Membuat satu reservasi atau lebih pada slot yang berbeda.
- Melihat confirmation code dari hasil booking.

### Admin

- Login dengan akun admin yang diprovision melalui environment.
- Melihat denah meja.
- Melihat reservasi terakhir pada meja.
- Mengubah status manual meja.

### Pengunjung publik

- Melihat landing page.
- Masuk ke halaman login.
- Melihat availability meja yang sudah difilter.
- Tidak dapat membuat booking tanpa JWT.

---

## 4. Scope Fitur

### 4.1 Landing page

- Brand RestoKalcer.
- Hero section dan CTA reservasi.
- Jam operasional.
- Informasi lokasi dan kontak.
- Responsive mobile layout.
- CTA selalu mengarahkan user ke login bila belum authenticated.

### 4.2 Authentication

- Register customer.
- Login customer/admin.
- Password di-hash menggunakan bcryptjs.
- Login menghasilkan JWT.
- JWT disimpan frontend untuk sesi demo.
- Logout membersihkan sesi frontend.
- Password minimum 8 karakter.

### 4.3 Reservation workspace

- Tanggal reservasi.
- Jam kedatangan dalam jam operasional 10.00–22.00.
- Durasi default 2 jam.
- Jumlah tamu 1–12 di frontend dan divalidasi ulang di backend.
- Daftar meja dari database.
- Filter availability berdasarkan tanggal, jam, dan kapasitas.
- Pemilihan meja tersedia.
- Nama pelanggan.
- Catatan opsional.
- Loading, validation, conflict, dan network error state.
- Modal konfirmasi setelah booking berhasil.

### 4.4 Admin dashboard

- Role guard backend.
- Daftar/denah 15 meja seed.
- Status:
  - Tersedia.
  - Pending/terpesan pada slot.
  - Terisi/manual unavailable.
- Detail reservasi terakhir pada meja.
- Set meja tersedia atau manual unavailable.

### 4.5 Data dan API

Entity MVP:

- `users`
- `restaurant_tables`
- `reservations`

Endpoint utama:

| Method | Endpoint | Akses | Fungsi |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register customer |
| POST | `/api/auth/login` | Public | Login dan JWT |
| GET | `/api/reservasi/meja` | Public | Availability meja |
| POST | `/api/reservasi/booking` | JWT | Membuat reservasi |
| GET | `/api/reservasi/detail/:id_meja` | Admin | Detail reservasi meja |
| PUT | `/api/reservasi/update-status` | Admin | Update status manual meja |
| GET | `/health/live` | Public | Health check |

---

## 5. Aturan Bisnis MVP

1. Customer wajib memiliki JWT untuk membuat reservasi.
2. Hanya `admin` yang dapat mengubah status meja atau membaca detail operasional.
3. Jam reservasi harus berada di antara 10.00 dan 22.00.
4. End time default adalah start time + 2 jam.
5. Jumlah tamu tidak boleh melebihi kapasitas meja.
6. Reservasi aktif adalah `pending`, `confirmed`, atau `seated`.
7. Reservasi `cancelled`, `completed`, atau `no_show` tidak memblokir meja.
8. Reservasi aktif yang overlap pada meja yang sama ditolak.
9. Dua request concurrent untuk meja dan slot sama hanya boleh menghasilkan satu booking.
10. Meja manual unavailable tidak dapat dipesan.
11. Data tersimpan di PostgreSQL dan tidak bergantung pada memory process.
12. Status visual frontend bukan pengganti authorization backend.

---

## 6. Arsitektur dan Struktur Folder

```text
SwF/
├── PRD.md
├── frontend/
│   ├── package.json
│   ├── index.html
│   ├── public/
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       ├── assets/
│       ├── components/
│       │   ├── AdminDashboard.jsx
│       │   ├── BookingFilters.jsx
│       │   ├── ConfirmationModal.jsx
│       │   ├── Footer.jsx
│       │   ├── Login.jsx
│       │   ├── Navbar.jsx
│       │   ├── ReservationForm.jsx
│       │   ├── ReservationWorkspace.jsx
│       │   ├── TableMap.jsx
│       │   └── Toast.jsx
│       ├── hooks/
│       │   └── useBooking.js
│       ├── services/
│       │   └── api.js
│       └── utils/
│           └── validation.js
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── postgres.sql
│   ├── server.js
│   ├── src/
│   │   ├── db.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── reservasiController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── validation.js
│   │   └── routes/
│   │       ├── authRoutes.js
│   │       └── reservasiRoutes.js
│   └── tests/
│       └── backend.integration.test.js
└── README.md
```

### Prinsip struktur

- `components/` hanya untuk UI reusable.
- `hooks/` untuk stateful frontend behavior.
- `services/` untuk komunikasi API.
- `utils/` untuk validation dan helper murni.
- `controllers/` untuk HTTP-to-service logic sederhana.
- `middleware/` untuk auth dan validation.
- `tests/` terpisah dari source production.
- Backend tidak boleh menggunakan model in-memory untuk data bisnis.

---

## 7. Status Implementasi

### Sudah tersedia

- UI landing, authentication, reservation, admin.
- Responsive layout dan micro-interactions.
- PostgreSQL connection.
- Schema dan seed meja.
- bcryptjs.
- JWT.
- RBAC admin.
- Server-side validation.
- Availability query berbasis tanggal/waktu/kapasitas.
- Transaction booking.
- Database exclusion constraint.
- Anti-double-booking.
- Integration test P0.

### Fokus penyelesaian MVP

1. Pastikan frontend mengirim filter availability ke backend.
2. Pastikan user yang belum login diarahkan ke login sebelum booking.
3. Pastikan confirmation menampilkan data reservation dari response.
4. Pastikan admin flow memakai endpoint database.
5. Pastikan API field naming konsisten.
6. Tambahkan README deployment.
7. Jalankan smoke test lokal end-to-end.

---

## 8. Non-Functional Requirements Ringkas

- Frontend `npm run lint` dan `npm run build` harus lulus.
- Backend syntax check dan `npm test` harus lulus.
- API privat mengembalikan `401` tanpa token.
- API role tidak sesuai mengembalikan `403`.
- Error validasi mengembalikan `400`.
- Konflik booking mengembalikan `409`.
- Production dependency tidak memiliki vulnerability high/critical yang diketahui.
- `.env` tidak boleh di-commit.
- UI dapat digunakan pada mobile viewport.
- Tidak ada password atau token yang ditulis ke log.

---

## 9. Deployment Portfolio

Rekomendasi:

```text
Frontend  → Vercel
Backend   → Render atau Railway
Database  → Supabase PostgreSQL
```

Environment frontend:

```env
VITE_API_URL=https://backend-domain.example/api
```

Environment backend:

```env
DATABASE_URL=postgresql://...
DATABASE_SSL=true
JWT_SECRET=secret-random-minimal-32-karakter
FRONTEND_ORIGIN=https://frontend-domain.example
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password-admin-kuat
PORT=5000
```

---

## 10. Definition of Done Portfolio

MVP dianggap selesai jika:

- Landing page dapat dibuka.
- Customer dapat register dan login.
- Admin dapat login.
- Customer tanpa token tidak dapat booking.
- Customer dapat memilih slot dan meja.
- Reservasi tersimpan di PostgreSQL.
- Double booking ditolak.
- Customer mendapat confirmation modal.
- Admin dapat melihat dan mengubah status meja.
- Refresh backend tidak menghapus data.
- Test backend lulus.
- Frontend lint/build lulus.
- README berisi setup lokal, environment, fitur, dan demo credentials.
- Aplikasi berhasil di-deploy dan URL demo dapat dibagikan.

---

## 11. Next Plan

### Tahap A — Penyelesaian MVP

1. Sinkronkan filter frontend dengan endpoint availability.
2. Perbaiki confirmation dan error state.
3. Uji login customer/admin secara end-to-end.
4. Rapikan nama field API.

### Tahap B — Deploy

1. Buat database Supabase.
2. Deploy backend.
3. Set environment production.
4. Deploy frontend.
5. Test seluruh alur pada URL production.

### Tahap C — Portfolio presentation

1. Buat README.
2. Tambahkan screenshot.
3. Tambahkan architecture diagram sederhana.
4. Tambahkan demo URL.
5. Tambahkan known limitations.

Fitur startup-scale tidak dikerjakan sebelum MVP portfolio ini selesai dan terdeploy.
