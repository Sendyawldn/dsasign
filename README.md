# DSASign

DSASign is a Next.js web app for generating ElGamal/DSA-style key pairs, signing documents, and verifying signatures with visible math steps. It is designed for an educational signer/verifier workflow, not for long-term storage or multi-user account management.

## What it does

- Generate a public/private key pair.
- Sign an uploaded document or a provided document hash.
- Verify a document, signature, and public key against the server-side math.
- Show step-by-step output so the cryptographic process can be explained in class or in a paper.

## Project Structure

- `src/app/page.tsx` - landing page
- `src/app/keygen/page.tsx` - key generation screen
- `src/app/sign/page.tsx` - signing screen
- `src/app/verify/page.tsx` - verification screen
- `src/app/api/keygen/route.ts` - key generation API
- `src/app/api/sign/route.ts` - signing API
- `src/app/api/verify/route.ts` - verification API
- `src/lib/elgamal.ts` - modular math and key generation
- `src/lib/dsa.ts` - signing and verification logic
- `src/lib/hash.ts` - SHA-256 helper
- `docs/` - project brief, API contract, flow overview, and design intent

## Setup

1. Install dependencies.

```bash
npm install
```

2. Copy the example environment file if you want local overrides.

```bash
cp .env.example .env.local
```

3. Start the development server.

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Environment Variables

- `NEXT_PUBLIC_APP_NAME` - display name for the app.
- `NEXT_PUBLIC_APP_URL` - canonical local or deployed URL.
- `KEY_SIZE_Q` - default q bit size for key generation.
- `KEY_SIZE_P` - default p bit size for key generation.
- `MAX_FILE_SIZE_MB` - upload limit for signing and verification.

## Main Workflow

1. Open the landing page and choose a route.
2. Generate a key pair on `/keygen`.
3. Use `/sign` to upload a document and create a signature.
4. Use `/verify` to upload the document, signature, and public key.
5. Read the step-by-step result and download the JSON payloads when needed.

## API Routes

- `POST /api/keygen` - generate a key pair
- `POST /api/sign` - sign a document or document hash
- `POST /api/verify` - verify a document signature

See [docs/api-contract.md](docs/api-contract.md) for the request and response shapes.

## Validation

Run the basic checks before shipping changes.

```bash
npm run lint
npm test
npm run build
```

## Documentation

- [docs/doc-index.md](docs/doc-index.md)
- [docs/project-brief.md](docs/project-brief.md)
- [docs/architecture-decision-record.md](docs/architecture-decision-record.md)
- [docs/flow-overview.md](docs/flow-overview.md)
- [docs/api-contract.md](docs/api-contract.md)
- [docs/database-schema.md](docs/database-schema.md)
- [docs/DESIGN.md](docs/DESIGN.md)
- [docs/design-intent.json](docs/design-intent.json)
