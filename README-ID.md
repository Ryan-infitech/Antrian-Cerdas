<div align="right">

<a href="README.md"><img src="https://flagcdn.com/w40/gb.png" width="25"></a> | <a href="README-ID.md"><img src="https://flagcdn.com/w40/id.png" width="20"></a>

</div>

# 🎯 Antrian Cerdas

<div align="center">

[![dokumentasi](https://img.shields.io/badge/Dokumentasi-00A4EF?style=for-the-badge&logo=book&logoColor=white)](https://drive.google.com/file/d/1GBu5H575v_uqBr4ngZ9sWGamLDTu1xiP/view?usp=sharing) [![Pratinjau Langsung](https://img.shields.io/badge/Demo_Langsung-00A4EF?style=for-the-badge&logo=web&logoColor=white)](antrian-cerdas.vercel.app)

</div>

Sistem manajemen antrian digital modern yang dibangun dengan React dan Supabase. Buat dan kelola antrian secara efisien dengan pembaruan real-time dan integrasi kode QR.

## ✨ Fitur Utama

- 🚀 **Pembaruan Real-time**: Perubahan status antrian secara instan
- 📱 **Integrasi Kode QR**: Bergabung dengan antrian dengan mudah melalui pemindaian kode QR
- 🔐 **Autentikasi Aman**: Manajemen pengguna bawaan
- 🎯 **Manajemen Antrian**: Dashboard kontrol antrian yang efisien
- 🌈 **UI Modern**: Desain responsif dengan Tailwind CSS
- ⚡ **Performa**: Dibangun dengan React dan TypeScript

## 📸 Pratinjau

### Halaman Buat Antrian

![Buat Antrian](./readmeee/create%20queue.png)
_Buat dan kelola antrian Anda dengan antarmuka yang mudah digunakan_

### Bergabung dengan Antrian via QR

<div align="center">
<img src="./readmeee/join queue.png" height="720">
</div>

_Pelanggan dapat dengan cepat bergabung dengan antrian dengan memindai kode QR_

### Dashboard Manajemen Antrian

![Manajemen Antrian](./readmeee/queue%20managemenet.png)
_Pantau dan kendalikan antrian Anda secara real-time_

### Tampilan Status Antrian

![Status Antrian](./readmeee/queue%20status.png)
_Pengguna dapat melacak posisi mereka dalam antrian_

## 📱 Fitur Utama

### Pembuatan Antrian

- Buat antrian kustom dengan pengidentifikasi unik
- Hasilkan kode QR yang dapat dibagikan
- Atur preferensi dan pengaturan antrian

### Manajemen Antrian

- Pemantauan antrian real-time
- Panggil antrian berikutnya
- Tandai entri sebagai selesai/dilewati
- Lihat statistik antrian

### Pengalaman Pengguna

- Bergabung dengan antrian melalui pemindaian kode QR
- Pembaruan posisi real-time
- Antarmuka dioptimalkan untuk perangkat seluler
- Notifikasi push (segera hadir)

## 🛠️ Teknologi yang Digunakan

<div align="center">

<img src="https://github.com/Ryan-infitech/Map-Informasi-Bencana/blob/main/readmemedia/vite+react.gif?raw=true"> 
<img src="./readmeee/supaabase.gif">
<img src="https://github.com/Ryan-infitech/Map-Informasi-Bencana/blob/main/readmemedia/vercel.gif?raw=true"> <img src="https://assets-v2.lottiefiles.com/a/a6a0fab2-9a75-11ef-ae6f-0fa9df9d2963/wVrVQOzKYY.gif" width="120"> <img src="https://github.com/Ryan-infitech/Map-Informasi-Bencana/blob/main/readmemedia/tailwind.gif?raw=true">

</div>

## 🚀 Memulai

### Prasyarat

- Node.js (v14 atau lebih tinggi)
- npm/yarn
- Akun Supabase

### Instalasi

1. Klon repositori:

```bash
git clone https://github.com/yourusername/antrian-cerdas.git
cd antrian-cerdas
```

2. Instal dependensi:

```bash
npm install
```

3. Konfigurasi variabel lingkungan:

```bash
cp .env.example .env
```

4. Perbarui `.env` dengan kredensial Supabase Anda:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Jalankan server pengembangan:

```bash
npm run dev
```

Kunjungi `http://localhost:5173` untuk melihat aplikasi berjalan!

## 🗄️ Skema Database

### Tabel

- `queues`: Metadata dan pengaturan antrian
- `queue_entries`: Entri antrian individual
- `users`: Autentikasi dan profil pengguna

## 🤝 Kontribusi

1. Fork repositori ini
2. Buat branch fitur (`git checkout -b fitur/FiturBaru`)
3. Commit perubahan Anda (`git commit -m 'Menambahkan FiturBaru'`)
4. Push ke branch (`git push origin fitur/FiturBaru`)
5. Buat Pull Request

## 📄 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT - lihat file [LICENSE](LICENSE) untuk detail lebih lanjut.

## 🙏 Ucapan Terima Kasih

- [Supabase](https://supabase.io/) untuk layanan backend yang luar biasa
- [Tailwind CSS](https://tailwindcss.com/) untuk framework CSS utility-first
- [Framer Motion](https://www.framer.com/motion/) untuk animasi yang mulus
- [React Hot Toast](https://react-hot-toast.com/) untuk notifikasi yang indah

## 📬 Kontak

[![whatsapp](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/6285157517798)
[![instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/ryan.septiawan__)

<br>

---

<p align="center">Dibuat dengan ❤️ untuk manajemen antrian yang lebih baik</p>
