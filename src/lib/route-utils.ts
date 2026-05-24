export type ParsedPayload = Record<string, unknown>;

export function getMaxFileSizeBytes(): number {
  const maxFileSizeMb = Number(process.env.MAX_FILE_SIZE_MB || 5);
  return Math.max(1, maxFileSizeMb) * 1024 * 1024;
}

export async function readPayload(request: Request): Promise<ParsedPayload> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const payload: ParsedPayload = {};
    formData.forEach((value, key) => {
      payload[key] = value;
    });
    return payload;
  }

  const text = await request.text();
  if (!text.trim()) {
    return {};
  }

  try {
    return JSON.parse(text) as ParsedPayload;
  } catch {
    throw new Error("Invalid JSON payload");
  }
}

export function isFile(value: unknown): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

export function toStringField(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "bigint") {
    return value.toString();
  }

  return undefined;
}

export function parseJsonValue<T>(value: unknown, fieldName: string): T {
  if (typeof value === "string") {
    return JSON.parse(value) as T;
  }

  if (typeof value === "object" && value !== null) {
    return value as T;
  }

  throw new Error(`Missing or invalid ${fieldName}`);
}

export function toBigIntField(value: unknown, fieldName: string): bigint {
  const text = toStringField(value);
  if (!text || !text.trim()) {
    throw new Error(`Missing or invalid ${fieldName}`);
  }

  return BigInt(text.trim());
}

export async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export function isInvalidRequestError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message === "Invalid JSON payload" ||
    error.message.startsWith("Missing or invalid")
  );
}
