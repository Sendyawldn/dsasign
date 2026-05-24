import { NextResponse } from "next/server";

import { verifySignature } from "@/lib/dsa";
import { generateSHA256 } from "@/lib/hash";
import {
  fileToBuffer,
  getMaxFileSizeBytes,
  isFile,
  isInvalidRequestError,
  parseJsonValue,
  readPayload,
  toBigIntField,
  toStringField,
} from "@/lib/route-utils";

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

    let documentHash = toStringField(payload.documentHash);
    const uploadedDocument = payload.document;

    if (isFile(uploadedDocument)) {
      if (uploadedDocument.size > getMaxFileSizeBytes()) {
        return createErrorResponse(
          "FILE_TOO_LARGE",
          "Uploaded document exceeds the configured file size limit.",
          413,
        );
      }

      const buffer = await fileToBuffer(uploadedDocument);
      documentHash = generateSHA256(buffer);
    }

    if (!documentHash) {
      return createErrorResponse(
        "INVALID_REQUEST",
        "Provide either an uploaded document or a documentHash value.",
        400,
      );
    }

    const signatureSource = payload.signature ?? {
      r: payload.r,
      s: payload.s,
    };
    const publicKeySource = payload.publicKey ?? {
      p: payload.p,
      q: payload.q,
      g: payload.g,
      y: payload.y,
    };

    const signature = parseJsonValue<{
      r?: unknown;
      s?: unknown;
    }>(signatureSource, "signature");
    const publicKey = parseJsonValue<{
      p?: unknown;
      q?: unknown;
      g?: unknown;
      y?: unknown;
    }>(publicKeySource, "publicKey");

    const result = verifySignature(
      documentHash,
      toStringField(signature.r) ?? "",
      toStringField(signature.s) ?? "",
      toBigIntField(publicKey.p, "publicKey.p"),
      toBigIntField(publicKey.q, "publicKey.q"),
      toBigIntField(publicKey.g, "publicKey.g"),
      toBigIntField(publicKey.y, "publicKey.y"),
    );

    return NextResponse.json({
      success: true,
      message: result.valid ? "Signature valid" : "Signature invalid",
      data: result,
    });
  } catch (error) {
    console.error("Error pada Verify Route:", error);
    if (isInvalidRequestError(error)) {
      return createErrorResponse(
        "INVALID_REQUEST",
        "The verification request is malformed or missing required fields.",
        400,
      );
    }

    return createErrorResponse(
      "CRYPTO_FAILURE",
      "Gagal memverifikasi signature.",
      500,
    );
  }
}
