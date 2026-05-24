# INSTRUKSI PROYEK: APLIKASI TANDA TANGAN DIGITAL BERBASIS EL GAMAL (DSASIGN)
Single Source of Truth — Dokumen ini adalah acuan utama pengerjaan proyek DSASign.

**Posisi Asisten:** Senior Full Stack Developer (Next.js 15 + Kriptografi Terapan Expert).

---

## 1. Ringkasan Proyek & Konteks Akademik

Membangun aplikasi web interaktif yang mengimplementasikan **Digital Signature Algorithm (DSA)** berbasis **El Gamal Cipher** untuk menandatangani dan memverifikasi dokumen digital secara nyata. Proyek ini merupakan implementasi praktis dari materi kriptografi kunci publik yang diterapkan dalam kehidupan sehari-hari.

### Konteks Makalah:
Proyek ini menjadi studi kasus utama dalam makalah berjudul:

> **"Implementasi El Gamal Cipher dalam Sistem Tanda Tangan Digital (DSA) untuk Keamanan Dokumen Elektronik Berbasis Web"**

### Peran Pengguna (Hanya 2):

**Signer (Penandatangan):** Menggenerate pasangan kunci (public & private key), mengunggah dokumen, lalu menandatanganinya secara digital menggunakan private key berbasis algoritma El Gamal/DSA.

**Verifier (Pemverifikasi):** Menerima dokumen beserta signature dan public key dari Signer, lalu memverifikasi keaslian dan integritas dokumen tersebut.

---

## 2. Struktur Folder Proyek

Proyek ini menggunakan arsitektur single-repo dengan pemisahan concerns yang jelas.

```
dsasign/
├── src/
│   ├── app/                  # Next.js App Router (Pages & API Routes)
│   │   ├── page.tsx          # Halaman utama (landing)
│   │   ├── sign/             # Halaman penandatanganan dokumen
│   │   ├── verify/           # Halaman verifikasi dokumen
│   │   ├── keygen/           # Halaman generate pasangan kunci
│   │   └── api/
│   │       ├── keygen/       # API: Generate kunci El Gamal
│   │       ├── sign/         # API: Tanda tangani dokumen
│   │       └── verify/       # API: Verifikasi signature
│   ├── lib/
│   │   ├── elgamal.ts        # Core: Implementasi matematika El Gamal
│   │   ├── dsa.ts            # Core: Implementasi DSA di atas El Gamal
│   │   └── hash.ts           # Utility: SHA-256 hashing
│   └── components/           # UI Components (Shadcn UI)
├── public/
└── .env
```

---

## 3. Stack Teknologi

### Core Cryptography (Backend Logic)
- **Runtime:** Node.js 22 LTS
- **Crypto Library:** Node.js built-in `crypto` module (SHA-256 hashing)
- **Big Integer:** `bigint` native JavaScript (untuk operasi modular exponentiation)
- **Algoritma:** El Gamal Signature Scheme → Digital Signature Algorithm (DSA)

### Backend (API Routes)
- **Framework:** Next.js 15 API Routes (App Router)
- **Validasi Input:** Zod v3
- **File Processing:** `formidable` (parsing file upload dokumen)

### Frontend (Dashboard)
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS v4.0
- **UI Components:** Shadcn UI + Lucide React
- **Visualisasi Proses:** Step-by-step UI yang menampilkan setiap tahap komputasi kriptografi

### Development Tools
- **IDE:** VS Code
- **Testing API:** Postman / Thunder Client
- **Deployment:** Vercel

---

## 4. Fitur Utama Aplikasi

### 🔑 Key Generation (Generate Pasangan Kunci)
- Generate bilangan prima `p` dan `q` secara acak dan aman.
- Hitung generator `g` berdasarkan parameter domain.
- Generate private key `x` (acak) dan public key `y = g^x mod p`.
- Tampilkan semua parameter dalam format yang mudah dipahami.
- Opsi download kunci dalam format `.json` atau `.pem`.

### ✍️ Document Signing (Penandatanganan Dokumen)
- Upload dokumen (PDF, TXT, DOCX — maksimal 5 MB).
- Hitung hash dokumen menggunakan SHA-256.
- Lakukan proses signing El Gamal/DSA: hasilkan pasangan signature `(r, s)`.
- Tampilkan langkah-langkah komputasi secara transparan (mode edukasi).
- Download signature dalam format `.json`.

### ✅ Signature Verification (Verifikasi Tanda Tangan)
- Upload dokumen asli + file signature + public key.
- Hitung ulang hash dokumen.
- Lakukan verifikasi matematis El Gamal/DSA.
- Tampilkan hasil: **VALID ✅** atau **TIDAK VALID ❌** dengan penjelasan mengapa.
- Visualisasi langkah verifikasi secara step-by-step.

### 📚 Mode Edukasi (Education Mode)
- Toggle "Tampilkan Detail Komputasi" untuk melihat setiap langkah matematika.
- Penjelasan inline untuk setiap variabel (`p`, `q`, `g`, `x`, `y`, `k`, `r`, `s`).
- Cocok untuk keperluan presentasi dan makalah akademik.

---

## 5. Alur Kerja Kriptografi (Core Algorithm)

### Key Generation
```
1. Pilih bilangan prima q (160-bit)
2. Pilih bilangan prima p sedemikian: p = k*q + 1 (1024-bit)
3. Pilih g: generator dari subgroup orde q dalam Z*p
4. Pilih private key x: 1 < x < q (acak)
5. Hitung public key y = g^x mod p
6. Output: Public Key (p, q, g, y) | Private Key (x)
```

### Signing (Penandatanganan)
```
1. Hitung hash pesan: H = SHA-256(dokumen)
2. Pilih bilangan acak k: 1 < k < q
3. Hitung r = (g^k mod p) mod q
4. Hitung s = k⁻¹ * (H + x*r) mod q
5. Output: Signature (r, s)
```

### Verification (Verifikasi)
```
1. Hitung hash pesan: H = SHA-256(dokumen)
2. Hitung w = s⁻¹ mod q
3. Hitung u1 = H*w mod q
4. Hitung u2 = r*w mod q
5. Hitung v = ((g^u1 * y^u2) mod p) mod q
6. Jika v == r → Signature VALID ✅
```

---

## 6. Struktur Data (Format JSON)

### Public Key
```json
{
  "algorithm": "ElGamal-DSA",
  "keyType": "public",
  "params": {
    "p": "...",
    "q": "...",
    "g": "...",
    "y": "..."
  },
  "createdAt": "2026-05-11T00:00:00Z"
}
```

### Private Key
```json
{
  "algorithm": "ElGamal-DSA",
  "keyType": "private",
  "params": {
    "x": "..."
  },
  "warning": "JANGAN PERNAH BAGIKAN FILE INI!"
}
```

### Signature
```json
{
  "algorithm": "ElGamal-DSA",
  "documentHash": "sha256:abc123...",
  "signature": {
    "r": "...",
    "s": "..."
  },
  "signedAt": "2026-05-11T00:00:00Z"
}
```

---

## 7. API Routes

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| `POST` | `/api/keygen` | Generate pasangan kunci El Gamal/DSA |
| `POST` | `/api/sign` | Tandatangani dokumen (multipart/form-data) |
| `POST` | `/api/verify` | Verifikasi signature dokumen |

### Contoh Request Body `/api/sign`
```json
{
  "documentHash": "sha256:...",
  "privateKey": { "x": "..." },
  "params": { "p": "...", "q": "...", "g": "..." }
}
```

---

## 8. Environment Variables

```env
# App Config
NEXT_PUBLIC_APP_NAME=DSASign
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Key Size Configuration
KEY_SIZE_Q=160
KEY_SIZE_P=1024

# Upload Limit
MAX_FILE_SIZE_MB=5
```

---

## 9. Timeline Pengembangan

| Minggu | Target |
|--------|--------|
| 1 | Setup proyek Next.js 15, install dependencies, struktur folder |
| 2 | Implementasi matematika El Gamal di `elgamal.ts`: key gen, modular exponentiation, extended Euclidean |
| 3 | Implementasi DSA signing & verification di `dsa.ts` + SHA-256 hashing |
| 4 | Coding API Routes: `/api/keygen`, `/api/sign`, `/api/verify` + unit testing |
| 5 | Coding UI: halaman Key Generation + halaman Sign Document |
| 6 | Coding UI: halaman Verify + Mode Edukasi (tampilkan langkah komputasi) |
| 7 | Testing end-to-end (sign → verify valid & invalid), perbaikan bug |
| 8 | Deployment ke Vercel, penulisan dokumentasi + finalisasi makalah |

---

## 10. Alur Penggunaan (User Flow)

```
[SIGNER]
1. Buka dsasign.vercel.app
2. Klik "Generate Key Pair" → Dapatkan public key & private key
3. Download dan simpan kedua kunci
4. Klik "Sign Document" → Upload dokumen + masukkan private key
5. Klik "Tanda Tangani" → Download file signature (.json)
6. Kirim dokumen + signature + public key kepada Verifier

[VERIFIER]
1. Klik "Verify Signature"
2. Upload: dokumen asli + file signature + public key
3. Klik "Verifikasi"
4. Lihat hasil: VALID ✅ atau TIDAK VALID ❌
```

---

## 11. Catatan Khusus

- **Keamanan `k`:** Nilai `k` pada proses signing HARUS acak dan tidak boleh pernah digunakan dua kali. Penggunaan ulang `k` dengan private key yang sama dapat mengekspos private key sepenuhnya.
- **Ukuran Kunci:** Gunakan `q` minimal 160-bit dan `p` minimal 1024-bit untuk keamanan yang memadai di level akademik/demo.
- **Mode Edukasi vs Produksi:** Aplikasi ini dirancang untuk tujuan edukasi. Untuk produksi nyata, gunakan library seperti OpenSSL atau libsodium.
- **Tidak Menyimpan Kunci di Server:** Private key tidak pernah dikirim ke server dalam bentuk yang tersimpan — semua operasi bersifat stateless.
- **SHA-256 sebagai Hash Function:** Digunakan sebelum signing untuk memastikan ukuran pesan konsisten terlepas dari ukuran dokumen asli.
- **BigInt:** Semua operasi aritmetika kriptografi menggunakan `BigInt` native JavaScript untuk menghindari overflow pada bilangan besar.
