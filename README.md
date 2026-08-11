# SmartEval OMR & Diagnostik AI — Versi Web Application 🌐✨

Aplikasi Web modern untuk sistem koreksi otomatis Lembar Jawaban Komputer (LJK) 25 butir soal dan analisis diagnostik pembelajaran siswa berbasis AI (Groq LLaMA 3.3).

---

## 🚀 Fitur Utama

1. **Manajemen Ujian & Auto-Parse Template Excel (.xlsx)**:
   - Mengunggah template nilai Excel sekolah dan otomatis mengekstrak seluruh nama siswa di kelas.
2. **Kunci Jawaban & Pemetaan Materi 5 Blok (Kisi-kisi Resmi)**:
   - Mengatur 25 kunci jawaban dan memetakan materi indikator untuk analisis AI (misal: *Aljabar, Geometri, Pecahan, Statistika, Pengukuran*).
3. **Sensor OMR Computer Vision (OpenCV.js)**:
   - Memproses citra lembar LJK 25 soal secara langsung di browser tanpa perlu server berat.
   - Menampilkan status evaluasi per butir soal: `1. A ✔` (Benar) dan `2. D ✖` (Salah).
4. **Analisis Diagnostik AI (LLaMA 3.3 via Groq API)**:
   - Menganalisis letak kesalahan/miskonsepsi siswa secara spesifik per pokok materi kisi-kisi.
   - Memberikan rekomendasi konkret untuk siswa dan rekomendasi strategi mengajar bagi guru di kelas.
   - Menyusun program tindak lanjut (Remedial jika < KKM, Pengayaan jika >= KKM).
5. **Ekspor Laporan Excel Lengkap**:
   - Mengunduh spreadsheet nilai siswa dengan format resmi yang dilengkapi **2 Paragraf Rekomendasi AI** di bawah tabel.

---

## 💻 Cara Menjalankan Aplikasi Web

### Cara 1: Menggunakan Python Server (Direkomendasikan)
Buka terminal / Command Prompt pada folder `web_app/` dan jalankan:
```bash
python server.py
```
Aplikasi akan langsung membuka browser di alamat: **`http://localhost:8000`**.

### Cara 2: Membuka Langsung di Browser
Anda juga dapat langsung mengklik dua kali (*double-click*) berkas **`index.html`** untuk membukanya di browser seperti Google Chrome, Microsoft Edge, atau Mozilla Firefox.
