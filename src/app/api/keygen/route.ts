// src/app/api/keygen/route.ts
import { NextResponse } from "next/server";
import { generateKeyPair } from "@/lib/elgamal";
import { isInvalidRequestError, readPayload } from "@/lib/route-utils";

export const runtime = "nodejs";

function createErrorResponse(
  code: string,
  message: string,
  status: number,
  details?: string[],
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status },
  );
}

export async function POST(request: Request) {
  try {
    const payload = await readPayload(request);

    // Ambil ukuran bit dari environment variables, fallback ke 160/1024 jika tidak ada.
    const qBits = Number(payload.qBits ?? process.env.KEY_SIZE_Q ?? 160);
    const pBits = Number(payload.pBits ?? process.env.KEY_SIZE_P ?? 1024);

    if (!Number.isInteger(qBits) || qBits < 32) {
      return createErrorResponse(
        "INVALID_REQUEST",
        "qBits must be an integer of at least 32.",
        400,
      );
    }

    if (!Number.isInteger(pBits) || pBits <= qBits) {
      return createErrorResponse(
        "INVALID_REQUEST",
        "pBits must be an integer larger than qBits.",
        400,
      );
    }

    // Catatan: Mencari bilangan prima 1024-bit secara murni menggunakan JavaScript
    // akan memakan waktu komputasi beberapa detik. Ini normal.
    const keyPair = await generateKeyPair(qBits, pBits);

    return NextResponse.json(
      {
        success: true,
        message: "Pasangan kunci berhasil dibuat",
        data: keyPair,
      },
      { status: 201 },
    ); // 201 Created
  } catch (error) {
    console.error("Error pada Key Generation:", error);
    if (isInvalidRequestError(error)) {
      return createErrorResponse(
        "INVALID_REQUEST",
        "The request payload is malformed or missing required fields.",
        400,
      );
    }

    return createErrorResponse(
      "CRYPTO_FAILURE",
      "Gagal membuat pasangan kunci internal server.",
      500,
    );
  }
}
