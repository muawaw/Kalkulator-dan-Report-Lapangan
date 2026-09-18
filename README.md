# Kalkulator dan Report Lapangan (Tennis Court Calculator & Financial Report)

A personal web application for managing and reporting financial data for my tennis community (PKK). This system replaces the need for Google Sheets with desktop browser access by providing a dedicated application accessible from mobile and desktop browsers.

## Project Overview

**Purpose:** Help my tennis community manage financial reports and calculate court rental costs, eliminating the dependency on Google Sheets scripts that require desktop browser access on mobile devices.

**Status:**

- ✅ Backend: Fully functional
- ✅ Frontend: Fully developed
  - ✅ Home page
  - ✅ Configuration page
  - ✅ Calculator page
  - ✅ Dashboard page
  - ✅ Extend page (Hitung Extension)

## Tech Stack

### Backend

- **Language:** Go 1.27.1
- **Framework:** Chi v5 (HTTP router)
- **Database:** PostgreSQL
- **Key Libraries:**
  - `jackc/pgx/v5` - PostgreSQL driver
  - `go-chi/cors` - CORS middleware
  - `sqids/sqids-go` - ID obfuscation
  - `joho/godotenv` - Environment configuration

### Frontend

- **Framework:** React 19
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS 4
- **Routing:** React Router v7
- **Node Version:** Module type
- **Animation Libraries:** Framer Motion, Lottie React, dotlottie-react
- **UI Icons:** Lucide React

## Project Structure

```
project/
├── backend/                          # Go API Server
│   ├── cmd/
│   │   ├── main.go                  # Application entry point
│   │   └── api.go                   # Route definitions
│   ├── internal/
│   │   ├── adapters/postgres/
│   │   │   ├── migrations/          # Database migrations
│   │   │   └── sqlc/                # Generated SQL code
│   │   ├── core/
│   │   │   ├── handlers.go          # HTTP request handlers
│   │   │   ├── service.go           # Business logic
│   │   │   ├── dto.go               # Data transfer objects
│   │   │   ├── middleware.go        # HTTP middleware
│   │   │   ├── obfuscate.go         # ID obfuscation logic
│   │   │   └── json.go              # JSON utilities
│   │   └── env/
│   │       └── env.go               # Environment configuration
│   ├── API_DOCUMENTATION.md         # Complete API reference
│   ├── docker-compose.yaml          # Database setup
│   └── go.mod                        # Go dependencies
│
└── frontend/                         # React Application
    ├── src/
    │   ├── components/
    │   │   ├── navbar.jsx           # Navigation bar
    │   │   ├── home.jsx             # Home page
    │   │   ├── config.jsx           # Configuration management
    │   │   ├── calculator.jsx       # Court rental calculator
    │   │   └── dashboard.jsx        # Dashboard (placeholder)
    │   ├── services/
    │   │   └── api.js               # API client
    │   ├── App.jsx                  # Main app component
    │   ├── main.jsx                 # App entry point
    │   └── index.css                # Global styles
    ├── package.json                 # Dependencies
    ├── vite.config.js               # Vite configuration
    └── tailwind.config.js           # Tailwind CSS configuration
```

## Features

### 1. Master Data Management (Configuration)

- **Tennis Courts (Lapangan):** Create, read, update, delete court information
  - Court name
  - Hourly rental rate
  - Ball boy service fee

- **Club Schedule (Reclub):** Manage recurring schedule configurations
  - Schedule/day description
  - Total duration (hours)
  - Registration fee (automatically calculates hourly rate)

### 2. Financial Calculator

- Calculate court rental costs with the following inputs:
  - Court selection
  - Club schedule selection
  - Number of internal players
  - Number of external players
  - Cost sharing per internal player
  - Tips/gratuity (optional)
- Automatically calculates total cash in (kas_in)
- Option to add cash out (kas_out) with description
- Save calculations as financial reports

### 3. Financial Reporting

- Record daily financial transactions
  - Date
  - Cash in amount
  - Cash out amount
  - Description
- View all financial reports
- Update or delete existing reports

## API Endpoints

Full API documentation is available in [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)

**Main Endpoints:**

- `GET /api/health` - Health check
- `POST/GET/PUT/DELETE /api/config/lapangan` - Court management
- `POST/GET/PUT/DELETE /api/config/reclub` - Schedule management
- `POST/GET/PUT/DELETE /api/report-keuangan` - Financial reports

**Authentication:** All `/api/config/*` and `/api/report-keuangan/*` endpoints require `X-API-KEY` header

## Setup & Installation

### Backend Setup

1. Navigate to backend directory:

   ```bash
   cd backend
   ```

2. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your database connection details
   ```

3. Start PostgreSQL database:

   ```bash
   docker-compose up -d
   ```

4. Run the server:
   ```bash
   go run cmd/*.go
   ```

Server runs on `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:

   ```bash
   cd frontend
   ```

2. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with API configuration
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Run development server:
   ```bash
   npm run dev
   ```

Frontend runs on `http://localhost:5173` (default Vite port)

## Environment Configuration

### Backend (.env)

```
DB_CONN="host=localhost user=postgres password=postgres dbname=postgres sslmode=disable"
API_KEY=TEST_API_KEY
```

### Frontend (.env)

```
VITE_API_BASE_URL=http://localhost:5173
VITE_API_KEY=YOUR_API_KEY
ALLOWED_USERS=User1,User2,User3
```

## Development Scripts

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Backend

- `go run cmd/*.go` - Run server
- Database migrations are managed via the migration files in `internal/adapters/postgres/migrations/`

## Database

PostgreSQL is used for data persistence. The database schema includes:

- Master data tables for courts (lapangan) and schedules (reclub)
- Financial report table (report_keuangan)

Database is configured via Docker Compose for easy setup.

## Future Development

- 🔄 Additional features and enhancements to existing pages

## Notes

- ID obfuscation using Sqids (minimum length 8 characters)
- CORS enabled for all origins in development
- Request timeout: 60 seconds
- All financial amounts use numeric type for precision

---

# Kalkulator dan Report Lapangan (Kalkulator & Laporan Keuangan Lapangan Tenis)

Aplikasi web pribadi untuk mengelola dan melaporkan data keuangan komunitas tenis saya (PKK). Sistem ini menggantikan kebutuhan Google Sheets dengan akses browser desktop dengan menyediakan aplikasi khusus yang dapat diakses dari browser mobile dan desktop.

## Ringkasan Proyek

**Tujuan:** Membantu komunitas tenis saya mengelola laporan keuangan dan menghitung biaya sewa lapangan, menghilangkan ketergantungan pada skrip Google Sheets yang memerlukan akses browser desktop di perangkat mobile.

**Status:**

- ✅ Backend: Berfungsi penuh
- ✅ Frontend: Sepenuhnya dikembangkan
  - ✅ Halaman Home
  - ✅ Halaman Configuration
  - ✅ Halaman Calculator
  - ✅ Halaman Dashboard
  - ✅ Halaman Extend (Hitung Extension)

## Tech Stack

### Backend

- **Bahasa:** Go 1.27.1
- **Framework:** Chi v5 (HTTP router)
- **Database:** PostgreSQL
- **Pustaka Utama:**
  - `jackc/pgx/v5` - PostgreSQL driver
  - `go-chi/cors` - CORS middleware
  - `sqids/sqids-go` - ID obfuscation
  - `joho/godotenv` - Konfigurasi environment

### Frontend

- **Framework:** React 19
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS 4
- **Routing:** React Router v7
- **Node Version:** Module type
- **Animation Libraries:** Framer Motion, Lottie React, dotlottie-react
- **UI Icons:** Lucide React

## Struktur Proyek

```
project/
├── backend/                          # Go API Server
│   ├── cmd/
│   │   ├── main.go                  # Titik masuk aplikasi
│   │   └── api.go                   # Definisi rute
│   ├── internal/
│   │   ├── adapters/postgres/
│   │   │   ├── migrations/          # Migrasi database
│   │   │   └── sqlc/                # Kode SQL yang dihasilkan
│   │   ├── core/
│   │   │   ├── handlers.go          # Handler permintaan HTTP
│   │   │   ├── service.go           # Logika bisnis
│   │   │   ├── dto.go               # Data transfer objects
│   │   │   ├── middleware.go        # HTTP middleware
│   │   │   ├── obfuscate.go         # Logika obfuscation ID
│   │   │   └── json.go              # Utilitas JSON
│   │   └── env/
│   │       └── env.go               # Konfigurasi environment
│   ├── API_DOCUMENTATION.md         # Referensi API lengkap
│   ├── docker-compose.yaml          # Setup database
│   └── go.mod                        # Dependensi Go
│
└── frontend/                         # Aplikasi React
    ├── src/
    │   ├── components/
    │   │   ├── navbar.jsx           # Bar navigasi
    │   │   ├── home.jsx             # Halaman Home
    │   │   ├── config.jsx           # Manajemen konfigurasi
    │   │   ├── calculator.jsx       # Kalkulator sewa lapangan
    │   │   └── dashboard.jsx        # Dashboard (placeholder)
    │   ├── services/
    │   │   └── api.js               # Klien API
    │   ├── App.jsx                  # Komponen app utama
    │   ├── main.jsx                 # Titik masuk app
    │   └── index.css                # Gaya global
    ├── package.json                 # Dependensi
    ├── vite.config.js               # Konfigurasi Vite
    └── tailwind.config.js           # Konfigurasi Tailwind CSS
```

## Fitur

### 1. Manajemen Data Master (Konfigurasi)

- **Lapangan Tenis (Lapangan):** Buat, baca, perbarui, hapus informasi lapangan
  - Nama lapangan
  - Tarif sewa per jam
  - Biaya layanan ball boy

- **Jadwal Klub (Reclub):** Kelola konfigurasi jadwal berulang
  - Deskripsi jadwal/hari
  - Total durasi (jam)
  - Biaya pendaftaran (secara otomatis menghitung tarif per jam)

### 2. Kalkulator Keuangan

- Hitung biaya sewa lapangan dengan input berikut:
  - Pemilihan lapangan
  - Pemilihan jadwal klub
  - Jumlah pemain internal
  - Jumlah pemain eksternal
  - Biaya berbagi per pemain internal
  - Tips/gratifikasi (opsional)
- Secara otomatis menghitung total kas masuk (kas_in)
- Opsi untuk menambahkan kas keluar (kas_out) dengan deskripsi
- Simpan perhitungan sebagai laporan keuangan

### 3. Pelaporan Keuangan

- Catat transaksi keuangan harian
  - Tanggal
  - Jumlah kas masuk
  - Jumlah kas keluar
  - Deskripsi
- Lihat semua laporan keuangan
- Perbarui atau hapus laporan yang ada

## Endpoint API

Dokumentasi API lengkap tersedia di [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)

**Endpoint Utama:**

- `GET /api/health` - Pemeriksaan kesehatan
- `POST/GET/PUT/DELETE /api/config/lapangan` - Manajemen lapangan
- `POST/GET/PUT/DELETE /api/config/reclub` - Manajemen jadwal
- `POST/GET/PUT/DELETE /api/report-keuangan` - Laporan keuangan

**Autentikasi:** Semua endpoint `/api/config/*` dan `/api/report-keuangan/*` memerlukan header `X-API-KEY`

## Setup & Instalasi

### Setup Backend

1. Navigasi ke direktori backend:

   ```bash
   cd backend
   ```

2. Setup variabel environment:

   ```bash
   cp .env.example .env
   # Edit .env dengan detail koneksi database Anda
   ```

3. Jalankan database PostgreSQL:

   ```bash
   docker-compose up -d
   ```

4. Jalankan server:
   ```bash
   go run cmd/*.go
   ```

Server berjalan di `http://localhost:8000`

### Setup Frontend

1. Navigasi ke direktori frontend:

   ```bash
   cd frontend
   ```

2. Setup variabel environment:

   ```bash
   cp .env.example .env
   # Edit .env dengan konfigurasi API
   ```

3. Install dependensi:

   ```bash
   npm install
   ```

4. Jalankan development server:
   ```bash
   npm run dev
   ```

Frontend berjalan di `http://localhost:5173` (port default Vite)

## Konfigurasi Environment

### Backend (.env)

```
DB_CONN="host=localhost user=postgres password=postgres dbname=postgres sslmode=disable"
API_KEY=TEST_API_KEY
```

### Frontend (.env)

```
VITE_API_BASE_URL=http://localhost:5173
VITE_API_KEY=YOUR_API_KEY
ALLOWED_USERS=User1,User2,User3
```

## Script Pengembangan

### Frontend

- `npm run dev` - Jalankan development server
- `npm run build` - Build untuk production
- `npm run lint` - Jalankan ESLint
- `npm run preview` - Preview production build

### Backend

- `go run cmd/*.go` - Jalankan server
- Migrasi database dikelola melalui file migrasi di `internal/adapters/postgres/migrations/`

## Database

PostgreSQL digunakan untuk persistensi data. Skema database mencakup:

- Tabel data master untuk lapangan (lapangan) dan jadwal (reclub)
- Tabel laporan keuangan (report_keuangan)

Database dikonfigurasi melalui Docker Compose untuk setup yang mudah.

## Pengembangan Lebih Lanjut

- 🔄 Fitur tambahan dan peningkatan untuk halaman yang ada

## Catatan

- Obfuscation ID menggunakan Sqids (panjang minimum 8 karakter)
- CORS diaktifkan untuk semua origin dalam pengembangan
- Timeout permintaan: 60 detik
- Semua jumlah keuangan menggunakan tipe numeric untuk presisi
