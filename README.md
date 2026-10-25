# 🍽️ Website Reservasi Restoran — RestoKalcer

RestoKalcer adalah platform web full-stack untuk membantu pelanggan melakukan
reservasi meja restoran secara online dan membantu manajemen restoran mengelola
ketersediaan meja serta reservasi secara efisien.

Proyek ini dibuat sebagai **portfolio MVP** dengan fokus pada alur end-to-end,
keamanan API, integritas data PostgreSQL, dan pengalaman pengguna yang responsif.

## 🚀 Fitur Utama

- **Pemesanan meja online** — pelanggan memilih tanggal, waktu, jumlah tamu, dan
  meja berdasarkan ketersediaan.
- **Perlindungan double booking** — transaksi PostgreSQL dan exclusion constraint
  mencegah reservasi aktif yang bentrok pada meja dan rentang waktu yang sama.
- **Manajemen reservasi** — data pelanggan, meja, jadwal, jumlah tamu, catatan,
  dan status reservasi tersimpan di PostgreSQL.
- **Autentikasi dan otorisasi** — register/login dengan JWT, password hashing
  menggunakan bcrypt, serta role-based access control (RBAC).
- **Admin dashboard** — admin dapat melihat denah meja, detail reservasi terakhir,
  serta memperbarui status manual meja.
- **Validasi dan error state** — validasi frontend/backend, loading state, conflict
  handling, network error state, dan modal konfirmasi.
- **Responsive UI** — antarmuka React dengan custom CSS untuk desktop dan mobile.

## 🛠️ Arsitektur & Teknologi

### Frontend

- **React 19** — antarmuka berbasis komponen.
- **Vite** — development server dan production bundling.
- **JavaScript/JSX** — logika UI dan state management.
- **Custom CSS** — layout, responsive design, dan visual interaction.

Frontend menangani landing page, autentikasi, filter reservasi, pemilihan meja,
konfirmasi booking, admin dashboard, serta feedback loading dan error.

### Backend

- **Node.js dan Express** — RESTful API.
- **PostgreSQL dan `pg`** — persistence dan transaksi data.
- **JWT** — autentikasi endpoint terproteksi.
- **bcryptjs** — password hashing.
- **Helmet, CORS, dan express-rate-limit** — baseline security middleware.

Backend menangani validasi input, business rules, autentikasi JWT/RBAC,
parameterized query, transaction booking, dan pencegahan double booking.

## 📂 Struktur Folder Proyek

```text
website-reservasi-restoran/
├── backend/
│   ├── server.js                  # Express app dan server startup
│   ├── postgres.sql                # Schema, constraint, index, dan seed database
│   ├── .env.example                # Contoh konfigurasi environment
│   ├── src/
│   │   ├── db.js                   # PostgreSQL pool dan inisialisasi schema
│   │   ├── controllers/            # Handler autentikasi dan reservasi
│   │   ├── middleware/             # JWT/RBAC dan validasi request
│   │   └── routes/                 # Definisi endpoint REST API
│   └── tests/                      # Integration test backend
├── frontend/
│   ├── src/
│   │   ├── components/             # Komponen UI React
│   │   ├── hooks/                  # Stateful frontend logic
│   │   ├── services/               # Integrasi HTTP API
│   │   ├── utils/                  # Validasi dan helper frontend
│   │   └── App.jsx                 # Root application component
│   └── package.json
├── PRD.md                          # Scope, acceptance criteria, dan roadmap
├── .gitignore                      # File yang diabaikan Git
└── README.md                       # Dokumentasi utama proyek
```

## 🔌 Endpoint Utama

| Method | Endpoint | Akses | Fungsi |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Membuat akun customer |
| `POST` | `/api/auth/login` | Public | Login dan mendapatkan JWT |
| `GET` | `/api/reservasi/meja` | Public | Melihat ketersediaan meja |
| `POST` | `/api/reservasi/booking` | JWT | Membuat reservasi |
| `GET` | `/api/reservasi/detail/:id_meja` | Admin/receptionist | Melihat detail reservasi meja |
| `PUT` | `/api/reservasi/update-status` | Admin/receptionist | Memperbarui status manual meja |
| `GET` | `/health/live` | Public | Memeriksa status server |

## Menjalankan Secara Lokal

### Backend

1. Buat database PostgreSQL.
2. Salin `backend/.env.example` menjadi `backend/.env`.
3. Isi `DATABASE_URL`, `JWT_SECRET`, dan kredensial admin.
4. Jalankan:

```bash
cd backend
npm install
npm start
```

Schema dan seed meja dibuat saat startup. Alternatifnya, jalankan
`backend/postgres.sql` melalui pgAdmin atau PostgreSQL CLI.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend memakai `http://localhost:5000/api` secara default. Untuk backend
berbeda, buat `frontend/.env`:

```env
VITE_API_URL=https://backend-domain.example/api
```

## ✅ Validasi dan Production Build

```bash
cd frontend
npm run lint
npm run build

cd ../backend
npm test
```

Perintah validasi dijalankan dari folder masing-masing karena frontend dan
backend memiliki `package.json` terpisah.

## 🔐 Environment Variables

Konfigurasi backend tersedia di
[`backend/.env.example`](./backend/.env.example). Variable penting:

- `DATABASE_URL` — connection string PostgreSQL.
- `DATABASE_SSL` — gunakan `true` ketika deployment membutuhkan TLS.
- `JWT_SECRET` — secret random minimal 32 karakter.
- `JWT_EXPIRES_IN` — masa berlaku JWT, misalnya `2h`.
- `FRONTEND_ORIGIN` — origin frontend yang diizinkan oleh CORS.
- `ADMIN_USERNAME` dan `ADMIN_PASSWORD` — kredensial provisioning admin.

Jangan commit file `.env` atau secret production ke repository.

## Batasan MVP dan Pengembangan Berikutnya

Pembayaran, notifikasi, multi-cabang, reporting, loyalty, dan audit log kompleks
sengaja ditunda agar proyek tetap mudah didemokan dan dideploy sebagai portfolio.
Detail lengkap tersedia di [`PRD.md`](./PRD.md).

Pengembangan berikutnya yang direkomendasikan:

- Riwayat dan pembatalan reservasi untuk customer.
- Readiness health check dan observability.
- Database migration versioning.
- Frontend unit/component test dan CI/CD.
- Dokumentasi OpenAPI/Swagger.
