# SIG Shoes and Care Kota Bekasi

> **Sistem Informasi Geografis (SIG) Pemetaan Lokasi Cabang Jasa Shoes and Care di Kota Bekasi Berbasis Web**

Aplikasi Web GIS modern dan interaktif untuk pemetaan lokasi gerai resmi **Shoes and Care** di seluruh 12 wilayah kecamatan Kota Bekasi, dilengkapi pemisahan katalog perlakuan (*Treatment Umum* vs *Treatment Khusus Cabang*), kalkulator estimasi biaya, integrasi booking WhatsApp, dan analisis spasial jangkauan layanan (Fase 1 – Fase 3).

---

## 🌟 Fitur Utama

### 1. Peta Interaktif & Pemetaan Spasial (GIS)
* **12 Kecamatan Terpetakan:** Visualisasi poligon batas administratif 12 Kecamatan Kota Bekasi via GeoJSON terkurasi.
* **Pin Marker POI Presisi:** Marker vektor sepatu dengan label nama cabang (*Galaxy, Summarecon, Harapan Indah, Kemang Pratama, Jatiwaringin, Kranji, dsb.*) dan indikator status spesialisasi.
* **3 Pilihan Basemap Gratis Tanpa Watermark:** OpenStreetMap Standard, Esri World Street Map, dan Citra Satelit Resolusi Tinggi.
* **Buffer Jangkauan Layanan:** Slider radius buffer interaktif (0.5 km – 5.0 km) untuk simulasi radius jangkauan delivery & antar-jemput per gerai.
* **Heatmap Kepadatan Gerai:** Visualisasi konsentrasi persebaran gerai untuk memetakan area kompetisi tinggi vs area peluang pasar.
* **Deteksi GPS Lokasi Pengguna:** Perhitungan jarak otomatis secara akurat (*Haversine formula*) dari posisi pengguna ke seluruh cabang terdekat.

### 2. Manajemen & Pemisahan Layanan Cabang
* **Treatment UMUM (Standar Jaringan):** Layanan standar yang tersedia di seluruh cabang Shoes and Care (*Fast Clean, Deep Clean, Unyellowing Basic, Whitening, Leather Care, Sol Reglue*).
* **Treatment KHUSUS (Spesialisasi per Lokasi):** Layanan eksklusif per cabang (*Vibram Sole Swap, Denim Bleeding Removal, Custom Painting, Luxury Bag Spa, Icy Chamber Deoxidation, dsb.*) lengkap dengan harga dan garansi outlet.
* **Pendaftaran Cabang Baru:** Formulir pendaftaran cabang baru terintegrasi dengan mini-map pin picker interaktif.

### 3. Fasilitas Transaksi & Analisis Bisnis
* **Kalkulator Biaya & Estimasi:** Simulasi biaya berdasarkan bahan sepatu (*Canvas, Leather, Suede, Boots*), jumlah pasang, dan paket treatment yang dipilih.
* **1-Click WhatsApp Booking:** Template pesan booking WhatsApp otomatis yang tersusun rapi dengan rincian pesanan dan subtotal estimasi biaya.
* **Dashboard Analisis Spasial:** Analisis kesenjangan pasar (*Market Opportunity Gap*) yang mengidentifikasi kecamatan dengan potensi ekspansi tinggi.

---

## 🛠️ Tech Stack

* **Backend:** [Laravel 13](https://laravel.com/) (PHP 8.3)
* **Frontend:** [React 19](https://react.dev/) via [Inertia.js v2](https://inertiajs.com/)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
* **Peta & GIS:** [Leaflet.js](https://leafletjs.com/)
* **Ikonografi:** [Lucide React](https://lucide.dev/)
* **Database:** MySQL / SQLite
* **Asset Bundler:** [Vite v6](https://vitejs.dev/)

---

## 🚀 Panduan Instalasi & Menjalankan

### 1. Kloning Repositori
```bash
git clone https://github.com/AlvinBasari/GIS-S-C.git
cd GIS-S-C
```

### 2. Instalasi Dependensi PHP & JavaScript
```bash
composer install
npm install
```

### 3. Konfigurasi Environment
Salin file konfigurasi environment:
```bash
cp .env.example .env
php artisan key:generate
```

Sesuaikan database pada file `.env` (default menggunakan SQLite atau MySQL):
```env
DB_CONNECTION=sqlite
# Atau jika menggunakan MySQL:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=sig_shoecare
# DB_USERNAME=root
# DB_PASSWORD=
```

### 4. Migrasi & Seeder Data
Jalankan migrasi database beserta data awal 12 kecamatan dan 12 cabang resmi Shoes and Care Bekasi:
```bash
php artisan migrate:fresh --seed
```

### 5. Kompilasi Asset & Menjalankan Server
Kompilasi asset frontend:
```bash
npm run build
```

Jalankan server aplikasi:
```bash
php artisan serve
# Atau gunakan custom router:
# composer serve
```
Buka peramban di: **`http://127.0.0.1:8000`**

---

## 🧪 Menjalankan Pengujian (Testing)
Aplikasi ini dilengkapi pengujian fitur otomatis (Feature Test):
```bash
php artisan test
```

---

## 📄 Lisensi
Proyek ini dikembangkan untuk keperluan Sistem Informasi Geografis (SIG) Pemetaan Jasa Shoes and Care di Kota Bekasi.
