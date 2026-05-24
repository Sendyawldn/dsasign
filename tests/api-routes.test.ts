import { afterEach, describe, expect, it, vi } from "vitest";

import { POST as keygenPOST } from "@/app/api/keygen/route";
import { POST as signPOST } from "@/app/api/sign/route";
import { POST as verifyPOST } from "@/app/api/verify/route";
import { generateSHA256 } from "@/lib/hash";

const keygenMock = vi.hoisted(() => vi.fn());
const signMock = vi.hoisted(() => vi.fn());
const verifyMock = vi.hoisted(() => vi.fn());
const readPayloadMock = vi.hoisted(() => vi.fn());
const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
const originalMaxFileSizeMb = process.env.MAX_FILE_SIZE_MB;

function createFile(byteLength: number, name: string) {
  return new File([Buffer.alloc(byteLength, 97)], name, {
    type: "text/plain",
  });
}

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

  if (originalMaxFileSizeMb === undefined) {
    delete process.env.MAX_FILE_SIZE_MB;
  } else {
    process.env.MAX_FILE_SIZE_MB = originalMaxFileSizeMb;
  }
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

  it("returns file too large for sign uploads", async () => {
    process.env.MAX_FILE_SIZE_MB = "1";
    readPayloadMock.mockResolvedValue({
      document: createFile(1_048_577, "oversized.txt"),
      documentHash: "sha256:fallback",
      privateKey: { x: "3" },
      params: { p: "23", q: "11", g: "4" },
    });

    const response = await signPOST(
      new Request("http://localhost/api/sign", { method: "POST" }),
    );

    const payload = (await response.json()) as {
      success: boolean;
      error: { code: string };
    };

    expect(response.status).toBe(413);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe("FILE_TOO_LARGE");
    expect(signMock).not.toHaveBeenCalled();
  });

  it("uses the uploaded document instead of the fallback hash for sign", async () => {
    const document = createFile(32, "seal.txt");
    const expectedHash = generateSHA256(
      Buffer.from(await document.arrayBuffer()),
    );

    readPayloadMock.mockResolvedValue({
      document,
      documentHash: "sha256:fallback",
      privateKey: { x: "3" },
      params: { p: "23", q: "11", g: "4" },
    });

    signMock.mockReturnValue({
      algorithm: "ElGamal-DSA",
      documentHash: expectedHash,
      signature: { r: "5", s: "8" },
      signedAt: "2026-05-24T00:00:00.000Z",
      steps: [],
    });

    const response = await signPOST(
      new Request("http://localhost/api/sign", { method: "POST" }),
    );

    const payload = (await response.json()) as {
      success: boolean;
      data: { documentHash: string };
    };

    expect(response.status).toBe(201);
    expect(payload.success).toBe(true);
    expect(payload.data.documentHash).toBe(expectedHash);
    expect(signMock).toHaveBeenCalledWith(expectedHash, 23n, 11n, 4n, 3n);
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

  it("returns file too large for verify uploads", async () => {
    process.env.MAX_FILE_SIZE_MB = "1";
    readPayloadMock.mockResolvedValue({
      document: createFile(1_048_577, "oversized.txt"),
      documentHash: "sha256:fallback",
      signature: { r: "5", s: "8" },
      publicKey: { p: "23", q: "11", g: "4", y: "18" },
    });

    const response = await verifyPOST(
      new Request("http://localhost/api/verify", { method: "POST" }),
    );

    const payload = (await response.json()) as {
      success: boolean;
      error: { code: string };
    };

    expect(response.status).toBe(413);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe("FILE_TOO_LARGE");
    expect(verifyMock).not.toHaveBeenCalled();
  });

  it("uses the uploaded document instead of the fallback hash for verify", async () => {
    const document = createFile(32, "verify.txt");
    const expectedHash = generateSHA256(
      Buffer.from(await document.arrayBuffer()),
    );

    readPayloadMock.mockResolvedValue({
      document,
      documentHash: "sha256:fallback",
      signature: { r: "5", s: "8" },
      publicKey: { p: "23", q: "11", g: "4", y: "18" },
    });

    verifyMock.mockReturnValue({
      valid: true,
      reason: "Signature matches the document hash and public key.",
      documentHash: expectedHash,
      signature: { r: "5", s: "8" },
      checkedAt: "2026-05-24T00:00:00.000Z",
      steps: [],
    });

    const response = await verifyPOST(
      new Request("http://localhost/api/verify", { method: "POST" }),
    );

    const payload = (await response.json()) as {
      success: boolean;
      data: { documentHash: string };
    };

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data.documentHash).toBe(expectedHash);
    expect(verifyMock).toHaveBeenCalledWith(
      expectedHash,
      "5",
      "8",
      23n,
      11n,
      4n,
      18n,
    );
  });
});
