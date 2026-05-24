import { modPow, modInverse, generateRandomBigInt } from "./elgamal";
import type {
  SignatureRecord,
  VerificationRecord,
  WorkflowStep,
} from "./contracts";

/**
 * Helper: Mengubah string hash hex (sha256:...) menjadi BigInt.
 * Diperlukan karena operasi matematika El Gamal membutuhkan angka, bukan string.
 */
function hashToBigInt(hashStr: string): bigint {
  // Buang prefix 'sha256:' jika ada
  const hexString = hashStr.replace("sha256:", "");
  return BigInt("0x" + hexString);
}

function normalizeMod(value: bigint, modulus: bigint): bigint {
  return ((value % modulus) + modulus) % modulus;
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
): SignatureRecord {
  const H = hashToBigInt(documentHash);
  const steps: WorkflowStep[] = [
    {
      label: "Hash",
      detail:
        "Converted the document hash into the numeric domain for signing.",
      value: H.toString(),
    },
  ];

  for (let attempt = 0; attempt < 128; attempt++) {
    // 2. Pilih bilangan acak k: 1 < k < q
    const k = generateRandomBigInt(2n, q - 1n);

    // 3. Hitung r = (g^k mod p) mod q
    const r = modPow(g, k, p) % q;
    if (r === 0n) {
      continue;
    }

    // 4. Hitung s = k⁻¹ * (H + x*r) mod q
    try {
      const kInv = modInverse(k, q);
      const s = normalizeMod(kInv * (H + x * r), q);

      if (s === 0n) {
        continue;
      }

      return {
        algorithm: "ElGamal-DSA",
        documentHash: documentHash,
        signature: {
          r: r.toString(),
          s: s.toString(),
        },
        signedAt: new Date().toISOString(),
        steps: [
          ...steps,
          {
            label: "Nonce k",
            detail:
              "Sampled a one-time nonce in the valid range; the exact value stays private.",
          },
          {
            label: "Signature r",
            detail:
              "Computed the first signature component from g^k mod p and reduced it mod q.",
            value: r.toString(),
          },
          {
            label: "Signature s",
            detail:
              "Combined the hash, private key, and nonce inverse to derive the final signature.",
            value: s.toString(),
          },
        ],
      };
    } catch {
      continue;
    }
  }

  throw new Error("Unable to generate a valid signature");
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
): VerificationRecord {
  const H = hashToBigInt(documentHash);
  const r = BigInt(rStr);
  const s = BigInt(sStr);
  const checkedAt = new Date().toISOString();
  const steps: WorkflowStep[] = [
    {
      label: "Hash",
      detail:
        "Recomputed the numeric document hash for the verification check.",
      value: H.toString(),
    },
  ];

  // Validasi awal: r dan s HARUS berada di dalam rentang 0 < r,s < q
  if (r <= 0n || r >= q || s <= 0n || s >= q) {
    return {
      valid: false,
      reason: "Signature values must satisfy 0 < r,s < q.",
      documentHash,
      signature: { r: r.toString(), s: s.toString() },
      checkedAt,
      steps: [
        ...steps,
        {
          label: "Range check",
          detail:
            "Rejected the signature because one or both values were outside the valid range.",
        },
      ],
    };
  }

  // 2. Hitung w = s⁻¹ mod q
  let w: bigint;

  try {
    w = modInverse(s, q);
  } catch {
    return {
      valid: false,
      reason: "Signature values do not produce an invertible s modulo q.",
      documentHash,
      signature: { r: r.toString(), s: s.toString() },
      checkedAt,
      steps: [
        ...steps,
        {
          label: "Inverse check",
          detail:
            "Rejected the signature because s has no modular inverse under q.",
        },
      ],
    };
  }

  // 3. Hitung u1 = H*w mod q
  const u1 = normalizeMod(H * w, q);

  // 4. Hitung u2 = r*w mod q
  const u2 = normalizeMod(r * w, q);

  // 5. Hitung v = ((g^u1 * y^u2) mod p) mod q
  // Pecah perhitungannya agar lebih mudah dibaca dan dieksekusi:
  const gu1 = modPow(g, u1, p);
  const yu2 = modPow(y, u2, p);
  const v = normalizeMod((gu1 * yu2) % p, q);

  // 6. Jika v == r -> Signature VALID ✅
  const valid = v === r;

  return {
    valid,
    reason: valid
      ? "Signature matches the document hash and public key."
      : "Signature does not match the document hash and public key.",
    documentHash,
    signature: { r: r.toString(), s: s.toString() },
    checkedAt,
    steps: [
      ...steps,
      {
        label: "w",
        detail: "Computed the inverse of s modulo q.",
        value: w.toString(),
      },
      {
        label: "u1",
        detail: "Combined the document hash with w.",
        value: u1.toString(),
      },
      {
        label: "u2",
        detail: "Combined the signature r value with w.",
        value: u2.toString(),
      },
      {
        label: "v",
        detail: "Reduced the comparison value through g^u1 and y^u2.",
        value: v.toString(),
      },
    ],
  };
}
