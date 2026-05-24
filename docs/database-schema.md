# Database Schema

## Persistence Stance

DSASign does not require a persistent database for the current scope.

The app generates keys, signs documents, and verifies signatures without storing user records, uploaded files, or key material on the server.

## Transient Data Shapes

These objects move through the API and UI, but they are not persisted by design.

### Public Key

```json
{
  "algorithm": "ElGamal-DSA",
  "keyType": "public",
  "params": {
    "p": "...",
    "q": "...",
    "g": "...",
    "y": "..."
  },
  "createdAt": "2026-05-24T00:00:00.000Z"
}
```

### Private Key

```json
{
  "algorithm": "ElGamal-DSA",
  "keyType": "private",
  "params": {
    "x": "..."
  },
  "warning": "JANGAN PERNAH BAGIKAN FILE INI!"
}
```

### Signature

```json
{
  "algorithm": "ElGamal-DSA",
  "documentHash": "sha256:...",
  "signature": {
    "r": "...",
    "s": "..."
  },
  "signedAt": "2026-05-24T00:00:00.000Z"
}
```

## Future Storage Note

If persistence is added later, the first schema should store only public artifacts and verification history. Private keys should remain local to the signer and should not be stored by default.
