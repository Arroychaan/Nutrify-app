# AI Ate Indonesia - Product Strategy & Vision

*Dokumen ini merupakan rangkuman visi strategis untuk AI Ate Indonesia, dirancang sebagai panduan bagi pengembangan produk jangka panjang menuju valuasi ratusan miliar.*

## 1. Insight Pasar Per Generasi

Pendekatan aplikasi harus disesuaikan dengan setiap generasi, bukan disamaratakan:

- **Gen Alpha (Di bawah ~15 tahun)**:
  - **Bukan target diet langsung**. Menargetkan mereka untuk "diet" atau "hitung kalori" berisiko tinggi memicu pola makan tidak sehat.
  - **Pendekatan**: "Family Mode". Orang tua (Millennial) mengatur nutrisi keluarga. Anak berinteraksi melalui edukasi gamified ("kenalan makanan bergizi"), bukan restriksi kalori.
  - **Default**: "Maintain sehat", bukan "Turun BB".

- **Gen Z**:
  - **Anti "diet culture"**. Lebih suka *wellness* daripada *kurus*.
  - **Kebutuhan**:
    - Personalisasi via AI chat berkarakter (tidak kaku).
    - Integrasi sosial (Share progress ke TikTok/IG Story).
    - Komunitas/Challenge bareng teman.
    - Kebanggaan lokal: makanan Indonesia direpresentasikan dengan hormat.
    - Harga terjangkau (freemium wajib).

- **Millennial (Usia 30-40an)**:
  - **Pembayar utama**. Realistis, sadar kesehatan, sibuk, mungkin sudah punya anak.
  - **Kebutuhan**:
    - Efisiensi: Meal planning otomatis, tracking makro tanpa ribet.
    - Integrasi: Apple Health / Mi Band / Strava.
    - Laporan kesehatan yang kredibel (bisa dibawa ke dokter/ahli gizi).

## 2. Moat Sebenarnya: Database Nutrisi Makanan Lokal

Kelemahan aplikasi luar (MyFitnessPal, Yazio) adalah database makanan Barat (USDA). Makanan Indonesia kompleks:
- Sering *mixed dish* (nasi padang = 5-6 lauk).
- Porsi lokal ("centong", "piring", "mangkok").
- Variasi resep tinggi antar daerah.
- **Peluang**: Membangun database nutrisi Indonesia yang tervalidasi (kerja sama dengan ahli gizi, Kemenkes, dll) menjadi aset berharga yang sulit ditiru dan bisa dimonetisasi (B2B).

## 3. Arsitektur Produk & AI (Level Teknis)

- **Food Recognition via Foto**: Model di-fine-tune khusus untuk makanan Indonesia (Multi-label detection dalam satu piring).
- **Estimasi Porsi**: Fase 1 cukup referensi visual sederhana (ukuran piring/centong). Fase 2 baru melangkah ke AR.
- **Voice & Text Logging**: Natural language processing ("tadi siang makan soto plus kerupuk 2"). Secara UX jauh lebih cepat.
- **AI Coach dengan Persona**: Punya nama, karakter, dan gaya bahasa adaptif.
- **Barcode Scan**: Quick win untuk produk kemasan (Indomie, minuman) dari data BPOM.

## 4. Fitur MVP (3-4 Bulan)

Fokus tunggal: **Logging makanan Indonesia paling akurat dan cepat**.

- [ ] Onboarding personalisasi (Tujuan: turun BB, jaga BB, kondisi khusus).
- [ ] Database makanan Indonesia (300-500 entri berkualitas).
- [ ] Logging via foto, search manual, dan voice/text input.
- [ ] Tracking kalori & makro harian sederhana.
- [ ] AI coach dasar (Tanya jawab, saran ringan).
- [ ] Streak harian & Kartu Progress estetis (Shareable ke IG/TikTok).
- [ ] Disclaimer: Bukan pengganti dokter/ahli gizi.

*Yang ditunda untuk Fase 2-3*: AR, Wearable integration, B2B, Marketplace.

## 5. Fitur Growth Engine ("Seru & Unik")

- **Diet Squad**: Grup circle pertemanan/keluarga untuk saling support.
- **Mode Puasa & Momen Budaya**: Ramadhan, Lebaran, dll. Momen viral organik.
- **Diet ala Nusantara Challenge**: Tantangan masakan daerah berkolaborasi dengan food creator.
- **Warung Score (Fase Lanjut)**: Badge "Warung Sehat" untuk UMKM. Insentif organik.
- **Kartu Progress Estetik**: Desain visual premium untuk organic growth loop via media sosial.

## 6. Model Bisnis & Skalabilitas

- **Freemium Subscription**: Dasar gratis, lanjutan berbayar (meal plan personal).
- **B2B API / Data Licensing**: Menjual API nutrisi Indonesia ke GoFood, GrabFood, FMCG. (Paling scalable).
- **Corporate Wellness**: B2B2C dengan margin tinggi untuk program kesehatan karyawan.
- **Affiliate/Partnership**: Katering sehat, dll (dengan sangat hati-hati).

## 7. Jalur Menuju Valuasi Tinggi

**Polanya**: 
1. MVP Kuat.
2. Traksi organik via konten (300rb-1jt MAU).
3. Monetisasi (Subs + B2B Pilot).
4. Data Moat membesar.
5. Funding Series A ("Database Nutrisi Indonesia Terlengkap").

*Kunci: Retensi (DAU/MAU), Revenue Growth, Defensibility Data.*

## 8. Catatan Etis (Penting!)

Mengingat jangkauan ke Gen Alpha dan area sensitif (berat badan), desain aplikasi HARUS bertanggung jawab. 
- **Under-18**: Edukasi gizi, BUKAN restriksi kalori.
- **Hindari**: Framing "berat ideal" untuk remaja.
- **Default Opsi**: "Maintain Sehat", bukan sekadar "Turun BB".
