import { NextResponse } from "next/server";

import { signDocument } from "@/lib/dsa";
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

    const privateKeySource = payload.privateKey ?? payload.x;
    const paramsSource = payload.params ?? {
      p: payload.p,
      q: payload.q,
      g: payload.g,
    };

    const privateKey = privateKeySource
      ? parseJsonValue<{ x?: unknown }>(privateKeySource, "privateKey")
      : undefined;
    const params = parseJsonValue<{
      p?: unknown;
      q?: unknown;
      g?: unknown;
    }>(paramsSource, "params");

    const x = toBigIntField(privateKey?.x ?? payload.x, "privateKey.x");
    const p = toBigIntField(params.p, "params.p");
    const q = toBigIntField(params.q, "params.q");
    const g = toBigIntField(params.g, "params.g");

    const signatureRecord = signDocument(documentHash, p, q, g, x);

    return NextResponse.json(
      {
        success: true,
        message: "Dokumen berhasil ditandatangani",
        data: signatureRecord,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error pada Sign Route:", error);
    if (isInvalidRequestError(error)) {
      return createErrorResponse(
        "INVALID_REQUEST",
        "The signing request is malformed or missing required fields.",
        400,
      );
    }

    return createErrorResponse(
      "CRYPTO_FAILURE",
      "Gagal menandatangani dokumen.",
      500,
    );
  }
}
