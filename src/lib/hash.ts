// src/lib/hash.ts
import { createHash } from "crypto";

/**
 * Menghitung nilai hash SHA-256 dari teks, buffer, atau dokumen.
 * Mengembalikan string dalam format hex (opsional diawali 'sha256:').
 */
export function generateSHA256(data: Buffer | string): string {
  // Buat instance hash SHA-256
  const hash = createHash("sha256");

  // Masukkan data ke dalam hash
  hash.update(data);

  // Hasilkan output dalam bentuk hexadecimal
  const hexOutput = hash.digest("hex");

  return `sha256:${hexOutput}`;
}
