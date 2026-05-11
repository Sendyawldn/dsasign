// src/lib/dsa.ts
import { modPow, modInverse, generateRandomBigInt } from "./elgamal";

/**
 * Helper: Mengubah string hash hex (sha256:...) menjadi BigInt.
 * Diperlukan karena operasi matematika El Gamal membutuhkan angka, bukan string.
 */
function hashToBigInt(hashStr: string): bigint {
  // Buang prefix 'sha256:' jika ada
  const hexString = hashStr.replace("sha256:", "");
  return BigInt("0x" + hexString);
}

/**
 * SIGNING (Penandatanganan)
 * Menghasilkan signature (r, s) dari dokumen hash menggunakan Private Key (x).
 */
export function signDocument(
  documentHash: string,
  p: bigint,
  q: bigint,
  g: bigint,
  x: bigint,
) {
  const H = hashToBigInt(documentHash);
  let r = 0n;
  let s = 0n;
  let k = 0n;

  // Sesuai aturan standar DSA, jika r atau s bernilai 0 (sangat jarang),
  // kita harus mengulang pencarian k.
  while (s === 0n) {
    while (r === 0n) {
      // 2. Pilih bilangan acak k: 1 < k < q
      k = generateRandomBigInt(2n, q - 1n);

      // 3. Hitung r = (g^k mod p) mod q
      r = modPow(g, k, p) % q;
    }

    // 4. Hitung s = k⁻¹ * (H + x*r) mod q
    const kInv = modInverse(k, q);
    s = (kInv * (H + x * r)) % q;
  }

  // Output sesuai dengan format JSON di instruksi
  return {
    algorithm: "ElGamal-DSA",
    documentHash: documentHash,
    signature: {
      r: r.toString(),
      s: s.toString(),
    },
    signedAt: new Date().toISOString(),
  };
}

/**
 * VERIFICATION (Verifikasi)
 * Memvalidasi signature (r, s) menggunakan Public Key (p, q, g, y).
 */
export function verifySignature(
  documentHash: string,
  rStr: string,
  sStr: string,
  p: bigint,
  q: bigint,
  g: bigint,
  y: bigint,
) {
  const H = hashToBigInt(documentHash);
  const r = BigInt(rStr);
  const s = BigInt(sStr);

  // Validasi awal: r dan s HARUS berada di dalam rentang 0 < r,s < q
  if (r <= 0n || r >= q || s <= 0n || s >= q) {
    return false; // Signature pasti tidak valid jika di luar rentang
  }

  // 2. Hitung w = s⁻¹ mod q
  const w = modInverse(s, q);

  // 3. Hitung u1 = H*w mod q
  const u1 = (H * w) % q;

  // 4. Hitung u2 = r*w mod q
  const u2 = (r * w) % q;

  // 5. Hitung v = ((g^u1 * y^u2) mod p) mod q
  // Pecah perhitungannya agar lebih mudah dibaca dan dieksekusi:
  const gu1 = modPow(g, u1, p);
  const yu2 = modPow(y, u2, p);
  const v = ((gu1 * yu2) % p) % q;

  // 6. Jika v == r -> Signature VALID ✅
  return v === r;
}
