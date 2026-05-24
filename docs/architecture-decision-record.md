# Architecture Decision Record

## Decision

Build dsasign as a single Next.js application with App Router pages, route handlers for the API, and shared server-side crypto modules in `src/lib`.

## Status

Accepted.

## Context

The project needs three user-facing flows: key generation, signing, and verification. Those flows share the same cryptographic primitives and benefit from the same codebase, validation layer, and UI navigation.

## Why This Fit

- The product is a compact academic web app, not a multi-service platform.
- The UI and API are tightly coupled around the same document workflow.
- Keeping the crypto logic in shared server modules makes the math easier to test and reuse.
- App Router route handlers keep upload parsing and API responses close to the feature that owns them.

## Consequences

- There is no separate backend service boundary.
- The app does not need a database for the current scope.
- File uploads are handled at the API boundary and hashed on the server.
- The browser owns presentation and form state; the server owns crypto and validation.

## Rejected Alternatives

- Separate API service: too much surface area for the current scope.
- Client-side cryptography only: harder to keep the implementation honest and consistent.
- Server actions only: less direct for file upload and explicit public API contracts.

## Notes

If the project later needs persistence, audit trails, or multi-tenant sharing, the current single-app layout should be split at the API boundary first.
