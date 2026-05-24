import { afterEach, describe, expect, it, vi } from "vitest";

import { POST as keygenPOST } from "@/app/api/keygen/route";
import { POST as signPOST } from "@/app/api/sign/route";
import { POST as verifyPOST } from "@/app/api/verify/route";

const keygenMock = vi.hoisted(() => vi.fn());
const signMock = vi.hoisted(() => vi.fn());
const verifyMock = vi.hoisted(() => vi.fn());
const readPayloadMock = vi.hoisted(() => vi.fn());
const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

vi.mock("@/lib/elgamal", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/elgamal")>();
  return {
    ...actual,
    generateKeyPair: keygenMock,
  };
});

vi.mock("@/lib/route-utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/route-utils")>();
  return {
    ...actual,
    readPayload: readPayloadMock,
  };
});

vi.mock("@/lib/dsa", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/dsa")>();
  return {
    ...actual,
    signDocument: signMock,
    verifySignature: verifyMock,
  };
});

afterEach(() => {
  vi.clearAllMocks();
  consoleErrorSpy.mockClear();
});

describe("API routes", () => {
  it("returns a generated key pair", async () => {
    readPayloadMock.mockResolvedValue({ qBits: 32, pBits: 64 });
    keygenMock.mockResolvedValue({
      publicKey: {
        algorithm: "ElGamal-DSA",
        keyType: "public",
        params: { p: "23", q: "11", g: "4", y: "18" },
        createdAt: "2026-05-24T00:00:00.000Z",
      },
      privateKey: {
        algorithm: "ElGamal-DSA",
        keyType: "private",
        params: { x: "3" },
        warning: "JANGAN PERNAH BAGIKAN FILE INI!",
      },
      steps: [],
    });

    const response = await keygenPOST(
      new Request("http://localhost/api/keygen", { method: "POST" }),
    );

    const payload = (await response.json()) as {
      success: boolean;
      data: { publicKey: { params: { p: string } } };
    };

    expect(response.status).toBe(201);
    expect(payload.success).toBe(true);
    expect(payload.data.publicKey.params.p).toBe("23");
  });

  it("returns invalid request for malformed keygen payloads", async () => {
    readPayloadMock.mockRejectedValueOnce(new Error("Invalid JSON payload"));

    const response = await keygenPOST(
      new Request("http://localhost/api/keygen", { method: "POST" }),
    );

    const payload = (await response.json()) as {
      success: boolean;
      error: { code: string };
    };

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("INVALID_REQUEST");
  });

  it("signs an uploaded document payload", async () => {
    readPayloadMock.mockResolvedValue({
      documentHash: "sha256:01",
      privateKey: { x: "3" },
      params: { p: "23", q: "11", g: "4" },
    });

    signMock.mockReturnValue({
      algorithm: "ElGamal-DSA",
      documentHash: "sha256:01",
      signature: { r: "5", s: "8" },
      signedAt: "2026-05-24T00:00:00.000Z",
      steps: [],
    });

    const response = await signPOST(
      new Request("http://localhost/api/sign", { method: "POST" }),
    );

    const payload = (await response.json()) as {
      success: boolean;
      data: { signature: { r: string } };
    };

    expect(response.status).toBe(201);
    expect(payload.success).toBe(true);
    expect(payload.data.signature.r).toBe("5");
  });

  it("verifies a signature payload", async () => {
    readPayloadMock.mockResolvedValue({
      documentHash: "sha256:01",
      signature: { r: "5", s: "8" },
      publicKey: { p: "23", q: "11", g: "4", y: "18" },
    });

    verifyMock.mockReturnValue({
      valid: true,
      reason: "Signature matches the document hash and public key.",
      documentHash: "sha256:01",
      signature: { r: "5", s: "8" },
      checkedAt: "2026-05-24T00:00:00.000Z",
      steps: [],
    });

    const response = await verifyPOST(
      new Request("http://localhost/api/verify", { method: "POST" }),
    );

    const payload = (await response.json()) as {
      success: boolean;
      data: { valid: boolean };
    };

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data.valid).toBe(true);
  });
});
