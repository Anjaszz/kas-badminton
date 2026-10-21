# 🏸 Aplikasi Kas Badminton Club

Aplikasi manajemen uang kas mingguan klub badminton dengan desain modern berbasis tema warna **Hitam, Merah, Putih, dan Hijau**. Terintegrasi dengan **Supabase Database** dan dilengkapi fallback offline / lokal otomatis.

---

## ✨ Fitur Utama

1. **Dashboard Ringkasan Keuangan**:
   - **Total Saldo Kas**: Saldo bersih kas saat ini (Total Kas Masuk - Total Pengeluaran) dengan aksen teks hijau menyala (*glow*).
   - **Total Kas Masuk**: Akumulasi seluruh setoran iuran kas mingguan dari anggota.
   - **Total Pengeluaran**: Akumulasi pengeluaran operasional (sewa lapangan, kok/shuttlecock, konsumsi, dll.) dengan badge merah.
   - **Status Iuran Minggu Ini**: Bar progres dan persentase anggota yang sudah lunas vs yang belum bayar.

2. **Manajemen Anggota (Tambah Orang & Tagihan)**:
   - Tambah anggota baru dengan nama, nomor WhatsApp, dan pilihan warna avatar.
   - **Akumulasi Bayar Per Orang**: Melihat total uang kas yang sudah disetor oleh setiap orang secara transparan.
   - Indikator status lunas / belum bayar untuk minggu berjalan.
   - Tombol **Bayar Kas Cepat** langsung dari kartu anggota.
   - Tombol **Ingatkan via WhatsApp** otomatis ke nomor anggota jika belum bayar.

3. **Catat Uang Kas Mingguan**:
   - Pilihan sesi minggu (contoh: *Minggu 3 - Oktober*).
   - Tombol pilihan nominal instan (Rp 10.000, 15.000, 20.000, 25.000, 50.000) atau nominal custom.
   - Tanggal & catatan pembayaran (Cash / Transfer BCA, dll.).

4. **Catat Pengeluaran (Uang Keluar)**:
   - Kategori pengeluaran badminton: Sewa Lapangan, Beli Shuttlecock, Konsumsi/Minum, Grip/Senar, P3K, Lainnya.
   - Tanggal dan catatan rinci pengeluaran.

5. **Riwayat Transaksi Masuk & Keluar**:
   - Riwayat lengkap transaksi dengan filter: *Semua*, *Kas Masuk*, dan *Pengeluaran*.
   - Filter pencarian berdasarkan nama anggota, keterangan, atau kategori.
   - Fitur hapus transaksi jika ada koreksi data.

6. **Laporan & Rekap Otomatis untuk WhatsApp**:
   - Format teks rekap mingguan yang rapi dan siap disalin/dishare langsung ke grup WA badminton dengan 1 klik.

---

## 🗄️ Panduan Integrasi Supabase

Aplikasi telah dilengkapi skrip SQL siap pakai di [supabase-schema.sql](file:///c:/Users/HYPE%20AMD/Desktop/Project%20Anjaszz/kas-badminton/supabase-schema.sql).

### Langkah Menghubungkan Supabase:

1. **Buka Supabase** di [https://supabase.com](https://supabase.com) dan buat proyek baru (atau gunakan proyek yang ada).
2. **Jalankan Skrip SQL**:
   - Masuk ke menu **SQL Editor** di dashboard Supabase Anda.
   - Salin isi file [supabase-schema.sql](file:///c:/Users/HYPE%20AMD/Desktop/Project%20Anjaszz/kas-badminton/supabase-schema.sql) (atau klik tombol **Salin Skrip SQL** di modal aplikasi).
   - Jalankan (*Run*) skrip tersebut. Tabel `members` dan `transactions` beserta index & row level security akan terbuat otomatis.
3. **Hubungkan ke Aplikasi**:
   - **Cara 1 (Dari Aplikasi Langsung)**: Klik tombol badge **Database** di pojok kanan atas aplikasi, lalu masukkan `Project URL` dan `Anon API Key` Anda, klik **Simpan Kredensial**.
   - **Cara 2 (File .env.local)**: Buat file `.env.local` di root proyek:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
     ```
4. **Migrasi Data Demo ke Supabase**:
   - Di modal database aplikasi, terdapat tombol **Upload Data Lokal ke Supabase** untuk langsung menyinkronkan data anggota & kas awal Anda ke Supabase.

---

## 🚀 Menjalankan Aplikasi Secara Lokal

```bash
# Install dependencies (jika baru pertama kali clone)
npm install

# Jalankan server development
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.
