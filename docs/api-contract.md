# API Contract

All API responses use a stable JSON shape with `code` and `message` at minimum. Do not return raw stack traces or internal errors to callers.

## POST /api/keygen

Generates a public/private key pair.

### Request

Optional JSON body:

```json
{
  "qBits": 160,
  "pBits": 1024
}
```

If no body is sent, the server uses the configured defaults.

### Success Response

`201 Created`

```json
{
  "success": true,
  "message": "Pasangan kunci berhasil dibuat",
  "data": {
    "publicKey": {
      "algorithm": "ElGamal-DSA",
      "keyType": "public",
      "params": {
        "p": "...",
        "q": "...",
        "g": "...",
        "y": "..."
      },
      "createdAt": "2026-05-24T00:00:00.000Z"
    },
    "privateKey": {
      "algorithm": "ElGamal-DSA",
      "keyType": "private",
      "params": {
        "x": "..."
      },
      "warning": "JANGAN PERNAH BAGIKAN FILE INI!"
    },
    "steps": []
  }
}
```

### Error Codes

- `INVALID_REQUEST`: bad JSON or invalid bit size.
- `CRYPTO_FAILURE`: prime search or math failed.

## POST /api/sign

Signs a document.

### Request

Supports either `multipart/form-data` or JSON.

Multipart fields:

- `document`: uploaded file
- `privateKey`: JSON string with `x`
- `params`: JSON string with `p`, `q`, and `g`

JSON body:

```json
{
  "documentHash": "sha256:...",
  "privateKey": { "x": "..." },
  "params": { "p": "...", "q": "...", "g": "..." }
}
```

### Success Response

```json
{
  "success": true,
  "message": "Dokumen berhasil ditandatangani",
  "data": {
    "algorithm": "ElGamal-DSA",
    "documentHash": "sha256:...",
    "signature": {
      "r": "...",
      "s": "..."
    },
    "signedAt": "2026-05-24T00:00:00.000Z",
    "steps": []
  }
}
```

### Error Codes

- `INVALID_REQUEST`: missing file, missing key data, malformed JSON, or invalid fields.
- `FILE_TOO_LARGE`: upload exceeds the configured limit.
- `CRYPTO_FAILURE`: signing math failed.

## POST /api/verify

Verifies a document signature.

### Request

Supports either `multipart/form-data` or JSON.

Multipart fields:

- `document`: uploaded file
- `signature`: JSON string with `r` and `s`
- `publicKey`: JSON string with `p`, `q`, `g`, and `y`

JSON body:

```json
{
  "documentHash": "sha256:...",
  "signature": { "r": "...", "s": "..." },
  "publicKey": { "p": "...", "q": "...", "g": "...", "y": "..." }
}
```

### Success Response

```json
{
  "success": true,
  "message": "Signature verification completed",
  "data": {
    "valid": true,
    "reason": "Signature matches the document hash and public key.",
    "documentHash": "sha256:...",
    "steps": []
  }
}
```

### Error Codes

- `INVALID_REQUEST`: missing input or malformed payload.
- `FILE_TOO_LARGE`: upload exceeds the configured limit.
- `SIGNATURE_INVALID`: signature values are outside the allowed range or do not match.
- `CRYPTO_FAILURE`: verification math failed.
