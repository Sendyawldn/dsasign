import { describe, expect, it } from "vitest";

import { isProbablePrime, modInverse, modPow } from "@/lib/elgamal";
import { signDocument, verifySignature } from "@/lib/dsa";

describe("crypto helpers", () => {
  it("computes modular exponentiation correctly", () => {
    expect(modPow(4n, 7n, 23n)).toBe(8n);
  });

  it("computes modular inverse correctly", () => {
    expect(modInverse(8n, 11n)).toBe(7n);
  });

  it("identifies small primes and composites", () => {
    expect(isProbablePrime(23n, 4)).toBe(true);
    expect(isProbablePrime(21n, 4)).toBe(false);
  });
});

describe("sign and verify", () => {
  it("produces a verifiable signature", () => {
    const signature = signDocument("sha256:01", 23n, 11n, 4n, 3n);
    const verification = verifySignature(
      signature.documentHash,
      signature.signature.r,
      signature.signature.s,
      23n,
      11n,
      4n,
      18n,
    );

    expect(signature.signature.r).not.toBe("");
    expect(signature.signature.s).not.toBe("");
    expect(verification.valid).toBe(true);
    expect(verification.reason).toMatch(/matches/i);
  });

  it("rejects signatures outside the allowed range", () => {
    const verification = verifySignature(
      "sha256:01",
      "0",
      "1",
      23n,
      11n,
      4n,
      18n,
    );

    expect(verification.valid).toBe(false);
    expect(verification.reason).toMatch(/0 < r,s < q/);
  });
});
