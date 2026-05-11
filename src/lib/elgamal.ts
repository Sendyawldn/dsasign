// src/lib/elgamal.ts

/**
 * Modular Exponentiation: Menghitung (base^exp) % mod
 * Sangat penting untuk menghitung Public Key (y) dan komponen Signature (r, v).
 * Menggunakan algoritma "Exponentiation by Squaring" agar efisien dan tidak memory leak.
 */
export function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = 1n;
  base = base % mod;

  while (exp > 0n) {
    // Jika exp ganjil, kalikan base dengan result
    if (exp % 2n === 1n) {
      result = (result * base) % mod;
    }
    // Geser bit exp ke kanan (dibagi 2) dan kuadratkan base
    exp = exp / 2n;
    base = (base * base) % mod;
  }

  return result;
}

/**
 * Extended Euclidean Algorithm: Mencari Modular Multiplicative Inverse
 * Digunakan untuk mencari s^-1 mod q (saat verifikasi) dan k^-1 mod q (saat signing).
 * Mengembalikan nilai x sedemikian sehingga (a * x) % m = 1
 */
export function modInverse(a: bigint, m: bigint): bigint {
  const m0 = m;
  let y = 0n;
  let x = 1n;

  if (m === 1n) return 0n;

  while (a > 1n) {
    // q adalah hasil bagi
    const q = a / m;
    let t = m;

    // m adalah sisa (remainder)
    m = a % m;
    a = t;
    t = y;

    // Update y dan x
    y = x - q * y;
    x = t;
  }

  // Pastikan x positif
  if (x < 0n) {
    x += m0;
  }

  return x;
}

/**
 * Generate bilangan acak k dalam rentang [min, max]
 * Kritis untuk proses Signing. Menggunakan built-in Node.js crypto.
 * Catatan: Fungsi ini hanya boleh berjalan di sisi server (API Routes).
 */
import { randomBytes } from "crypto";

export function generateRandomBigInt(min: bigint, max: bigint): bigint {
  const range = max - min;
  const hexLen = range.toString(16).length;
  const byteLen = Math.ceil(hexLen / 2);

  let randomVal: bigint;
  do {
    const buf = randomBytes(byteLen);
    randomVal = BigInt("0x" + buf.toString("hex"));
  } while (randomVal >= range); // Pastikan distribusi merata (hindari modulo bias)

  return randomVal + min;
}

/**
 * Miller-Rabin Primality Test
 * Digunakan untuk memastikan angka acak besar yang di-generate adalah bilangan prima.
 */
export function isProbablePrime(n: bigint, k = 5): boolean {
  if (n === 2n || n === 3n) return true;
  if (n <= 1n || n % 2n === 0n) return false;

  let d = n - 1n;
  let s = 0n;
  while (d % 2n === 0n) {
    d /= 2n;
    s += 1n;
  }

  for (let i = 0; i < k; i++) {
    const a = generateRandomBigInt(2n, n - 2n);
    let x = modPow(a, d, n);

    if (x === 1n || x === n - 1n) continue;

    let composite = true;
    for (let r = 1n; r < s; r++) {
      x = modPow(x, 2n, n);
      if (x === n - 1n) {
        composite = false;
        break;
      }
    }
    if (composite) return false;
  }
  return true;
}

/**
 * Menghasilkan pasangan kunci El Gamal / DSA.
 * Mengikuti tepat 6 langkah alur kerja kriptografi dari spesifikasi proyek.
 */
export async function generateKeyPair(
  qBits: number = 160,
  pBits: number = 1024,
) {
  // 1. Pilih bilangan prima q (160-bit)
  const qMin = 1n << BigInt(qBits - 1);
  const qMax = (1n << BigInt(qBits)) - 1n;
  let q = 0n;
  while (true) {
    q = generateRandomBigInt(qMin, qMax);
    if (isProbablePrime(q)) break;
  }

  // 2. Pilih bilangan prima p sedemikian: p = k*q + 1 (1024-bit)
  const pMin = 1n << BigInt(pBits - 1);
  const pMax = (1n << BigInt(pBits)) - 1n;
  let p = 0n;
  while (true) {
    // Cari pengali k secara acak
    const kMin = pMin / q;
    const kMax = pMax / q;
    const kMultiplier = generateRandomBigInt(kMin, kMax);

    p = kMultiplier * q + 1n;

    // Verifikasi apakah p berada di rentang bit yang benar dan merupakan prima
    if (p >= pMin && p <= pMax && isProbablePrime(p)) {
      break;
    }
  }

  // 3. Pilih g: generator dari subgroup orde q dalam Z*p
  // Rumus: g = h^((p-1)/q) mod p, di mana 1 < h < p-1
  let g = 1n;
  const exp = (p - 1n) / q;
  while (g === 1n) {
    const h = generateRandomBigInt(2n, p - 2n);
    g = modPow(h, exp, p);
  }

  // 4. Pilih private key x: 1 < x < q (acak)
  const x = generateRandomBigInt(2n, q - 1n);

  // 5. Hitung public key y = g^x mod p
  const y = modPow(g, x, p);

  // 6. Output struktur data JSON yang ketat sesuai instruksi dokumen
  const timestamp = new Date().toISOString();

  return {
    publicKey: {
      algorithm: "ElGamal-DSA",
      keyType: "public",
      params: {
        p: p.toString(),
        q: q.toString(),
        g: g.toString(),
        y: y.toString(),
      },
      createdAt: timestamp,
    },
    privateKey: {
      algorithm: "ElGamal-DSA",
      keyType: "private",
      params: {
        x: x.toString(),
      },
      warning: "JANGAN PERNAH BAGIKAN FILE INI!",
    },
  };
}
